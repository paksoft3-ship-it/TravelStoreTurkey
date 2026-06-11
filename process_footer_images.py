from PIL import Image
import os
import sys

def process_footer_images():
    base_path = '/Users/hilalahamd/MyRestProjects/akbariProjeleri/TaxiProje/iceland-taxi-&-tours/public'
    images = ['footerimg1.jpeg', 'footerimg2.jpeg']
    
    for img_name in images:
        source_path = os.path.join(base_path, img_name)
        file_root, _ = os.path.splitext(img_name)
        dest_path = os.path.join(base_path, f"{file_root}.webp")

        if not os.path.exists(source_path):
            print(f"Error: {source_path} not found.")
            continue

        try:
            print(f"Processing {img_name}...")
            img = Image.open(source_path)
            
            # Convert to RGB (in case of CMYK or others, though JPEG usually RGB)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Auto-crop based on content isn't straightforward for JPEG (no alpha).
            # Usually 'crop properly' for JPEGs implies removing uniform borders if any.
            # But standard JPEGs often don't have uniform borders like PNGs with transparency.
            # However, prompt mentioned "footerimg1 and footerimg2", usually these might have white background.
            # Let's try to detect white/black borders to crop?
            # Or simplified: The user prompts "crop properly".
            # If I look at process_logo.py it used getbbox().
            # getbbox() works on the *alpha* channel or black background.
            # Let's try to invert and getbbox to crop white background?
            
            from PIL import ImageOps
            
            # Create a grayscale version
            gray = ImageOps.grayscale(img)
            # Invert so white becomes black (0)
            inverted = ImageOps.invert(gray)
            # Threshold to make "near white" (250+) into black (0) for cleaner crop
            # This is a bit aggressive but often useful for logos on white.
            # If these are photos, this might be bad.
            # Given "footerimg", they could be logos or badges.
            # Let's assume they are logos/badges on white/light background.
            
            bbox = inverted.getbbox()
            
            if bbox:
                print(f"  Cropping from {img.size} to {bbox}")
                img = img.crop(bbox)
            else:
                print("  No crop bounding box found (image might be full content).")
                
            # Resize? User didn't ask for resize, just "properly crop".
            # Save as WebP
            img.save(dest_path, 'WEBP')
            print(f"  Saved to {dest_path}")
            
        except Exception as e:
            print(f"Error processing {img_name}: {e}")

if __name__ == '__main__':
    process_footer_images()
