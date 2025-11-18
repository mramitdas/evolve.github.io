import os
import json
import uuid
import asyncio
import binascii
from pathlib import Path
from typing import List
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values

load_dotenv()


DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT", "5432"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "dbname": os.getenv("DB_NAME"),
}


def load_mapping():
    if not Path(MAPPING_FILE).exists():
        return {}
    with open(MAPPING_FILE, "r") as f:
        return json.load(f)


def save_mapping(mapping: dict):
    with open(MAPPING_FILE, "w") as f:
        json.dump(mapping, f, indent=4)



def encrypt_file(input_path, output_path, key):
    with open(input_path, "rb") as f:
        data = f.read()

    iv = get_random_bytes(12)
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
    encrypted, tag = cipher.encrypt_and_digest(data)

    with open(output_path, "wb") as f:
        f.write(iv + encrypted + tag)


async def encrypt_file_async(src: Path, dst: Path, key: bytes) -> Path:
    await asyncio.to_thread(encrypt_file, src, dst, key)
    return dst


async def encrypt_missing_images_async(
    input_img_dir: str,
    output_img_dir: str,
    hex_key: str,
) -> List[Path]:

    input_path = Path(input_img_dir)
    output_path = Path(output_img_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    mapping = load_mapping()

    key = binascii.unhexlify(hex_key)
    if len(key) not in (16, 24, 32):
        raise ValueError("Invalid AES key size")

    input_pngs = sorted(input_path.glob("*.png"))

    tasks = []
    results = []

    for src in input_pngs:
        phone = src.stem  # original filename

        if phone in mapping:
            continue

        new_uuid = uuid.uuid4().hex  # hidden encrypted filename
        dst = output_path / f"{new_uuid}.enc"

        tasks.append(asyncio.create_task(encrypt_file_async(src, dst, key)))

        mapping[phone] = new_uuid  # store in JSON

    if tasks:
        results = await asyncio.gather(*tasks)

    save_mapping(mapping)
    return results



def update_image_urls(json_map_path: str, table_name: str = "clients"):

    with open(json_map_path, "r") as f:
        mapping = json.load(f)

    if not mapping:
        print("❌ No mappings found. Skipping DB update.")
        return

    # FIXED: correct tuple order (uuid, phone_number)
    update_list = [(uuid_value, phone) for phone, uuid_value in mapping.items()]

    sql = f"""
        UPDATE {table_name} AS t
        SET image_url = data.uuid::UUID
        FROM (VALUES %s) AS data(uuid, phone_number)
        WHERE t.phone_number = data.phone_number;
    """

    print(f"Updating {len(update_list)} rows in DB...")

    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            execute_values(cur, sql, update_list)
        conn.commit()
        print("✅ Database update completed successfully.")
    except Exception as e:
        conn.rollback()
        print("❌ DB Error:", e)
    finally:
        conn.close()



async def main(input_img_dir, output_img_dir, hex_key, MAPPING_FILE):

    encrypted_files = await encrypt_missing_images_async(
        input_img_dir=input_img_dir,
        output_img_dir=output_img_dir,
        hex_key=hex_key,
    )

    update_image_urls(MAPPING_FILE)

    print("Encrypted Images:", len(encrypted_files))
    print("Mapping saved to:", MAPPING_FILE)


if __name__ == "__main__":
    HEX_KEY = os.getenv("HEX_KEY")
    INPUT_IMG_DIR = os.getenv("INPUT_IMG_DIR")
    OUTPUT_IMG_DIR = os.getenv("OUTPUT_IMG_DIR")
    
    MAPPING_FILE = os.getenv("MAPPING_FILE")

    asyncio.run(main(INPUT_IMG_DIR, OUTPUT_IMG_DIR, HEX_KEY, MAPPING_FILE))
