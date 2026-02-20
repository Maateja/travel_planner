from PIL import Image, ImageOps
import os

try:
    print("Starting Favicon Generation (Full Bleed)...")
    logo_path = "logo.png"
    output_path = "favicon_box.png"
    
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found.")
        exit(1)

    img = Image.open(logo_path).convert("RGBA")
    
    # Create white square 32x32
    bg_size = (32, 32)
    bg = Image.new("RGBA", bg_size, "WHITE")
    
    # Resize logo to fit almost full bleed (30x30) inside 32x32
    logo_target_size = (30, 30)
    img.thumbnail(logo_target_size, Image.Resampling.LANCZOS)
    
    # Paste center
    offset = ((bg_size[0] - img.size[0]) // 2, (bg_size[1] - img.size[1]) // 2)
    bg.paste(img, offset, img)
    
    bg.save(output_path, "PNG")
    print(f"Successfully created {output_path}")

except Exception as e:
    print(f"Error: {e}")
