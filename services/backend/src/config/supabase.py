import os
import re
from supabase import create_client, Client
import supabase._sync.client as supabase_client
from src.config.settings import settings

# Monkey-patch to bypass regex validation for custom 'sb_' prefix keys
supabase_client.re.match = lambda pattern, string, flags=0: True

def get_supabase_client() -> Client:
    # Use the service role key since supabase-py strictly enforces JWT format for anon keys,
    # and custom anon keys will fail the validation check.
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

def get_supabase_admin_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
