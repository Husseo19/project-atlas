"""Add status, metadata and readiness_score trigger

Revision ID: ea1f5efbe239
Revises: 33bf4a364fa2
Create Date: 2026-08-13 15:33:46.398570

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ea1f5efbe239'
down_revision: Union[str, None] = '33bf4a364fa2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status TEXT;
        ALTER TABLE sessions ADD COLUMN IF NOT EXISTS metadata JSONB;
        ALTER TABLE sessions ALTER COLUMN type DROP NOT NULL;

        CREATE OR REPLACE FUNCTION update_readiness_score()
        RETURNS TRIGGER AS $$
        DECLARE
            avg_exam_score NUMERIC;
            avg_training_score NUMERIC;
            calculated_score NUMERIC;
        BEGIN
            IF NEW.status = 'completed' AND NEW.score IS NOT NULL THEN
                
                -- Calculate average of last 3 exam scores
                SELECT COALESCE(AVG(score), 0) INTO avg_exam_score
                FROM (
                    SELECT score 
                    FROM sessions 
                    WHERE user_id = NEW.user_id 
                      AND certification_id = NEW.certification_id 
                      AND mode = 'exam' 
                      AND status = 'completed' 
                    ORDER BY end_time DESC NULLS LAST
                    LIMIT 3
                ) sub;

                -- Calculate average of last 5 training scores
                SELECT COALESCE(AVG(score), 0) INTO avg_training_score
                FROM (
                    SELECT score 
                    FROM sessions 
                    WHERE user_id = NEW.user_id 
                      AND certification_id = NEW.certification_id 
                      AND mode = 'training' 
                      AND status = 'completed' 
                    ORDER BY end_time DESC NULLS LAST
                    LIMIT 5
                ) sub;

                IF avg_exam_score > 0 THEN
                    calculated_score := (avg_exam_score * 0.7) + (avg_training_score * 0.3);
                ELSE
                    calculated_score := avg_training_score * 0.8;
                END IF;

                INSERT INTO mastery_profiles (user_id, certification_id, readiness_score, updated_at)
                VALUES (NEW.user_id, NEW.certification_id, calculated_score, NOW())
                ON CONFLICT (user_id, certification_id)
                DO UPDATE SET readiness_score = EXCLUDED.readiness_score, updated_at = NOW();

            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_update_readiness ON sessions;
        CREATE TRIGGER trigger_update_readiness
        AFTER INSERT OR UPDATE OF status ON sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_readiness_score();
    """)


def downgrade() -> None:
    op.execute("""
        DROP TRIGGER IF EXISTS trigger_update_readiness ON sessions;
        DROP FUNCTION IF EXISTS update_readiness_score();
        ALTER TABLE sessions ALTER COLUMN type SET NOT NULL;
        ALTER TABLE sessions DROP COLUMN IF EXISTS metadata;
        ALTER TABLE sessions DROP COLUMN IF EXISTS status;
    """)
