import asyncio
import asyncpg
import os

async def main():
    env_path = r'c:\Users\Haxker\Desktop\Websites Antigravity\AI Educator\project-atlas\services\backend\.env'
    conn_str = None
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('POSTGRES_URL='):
                conn_str = line.strip().split('=', 1)[1]
                break

    if not conn_str:
        print("POSTGRES_URL not found")
        return

    # asyncpg expects postgres:// instead of postgresql+asyncpg://
    if conn_str.startswith('postgresql+asyncpg://'):
        conn_str = conn_str.replace('postgresql+asyncpg://', 'postgres://')

    print(f"Connecting...")
    conn = await asyncpg.connect(conn_str)
    
    try:
        print("Adding source column to questions table...")
        await conn.execute("ALTER TABLE questions ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'official';")
        
        print("Updating existing rows in questions to have source = 'official' if null...")
        await conn.execute("UPDATE questions SET source = 'official' WHERE source IS NULL;")
        
        print("Adding dark_mode_enabled column to profiles table...")
        await conn.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dark_mode_enabled BOOLEAN DEFAULT false;")
        
        print("Notifying pgrst to reload schema...")
        await conn.execute("NOTIFY pgrst, 'reload schema';")
        print("Done!")
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
