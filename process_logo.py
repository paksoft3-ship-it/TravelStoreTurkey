
from PIL import Image
import os
import numpy as np

def process_images():
    source_path = '/Users/hilalahamd/MyRestProjects/akbariProjeleri/TaxiProje/iceland-taxi-&-tours/public/logo1.png'
    logo_dest_path = '/Users/hilalahamd/MyRestProjects/akbariProjeleri/TaxiProje/iceland-taxi-&-tours/public/logo.png'
    favicon_dest_path = '/Users/hilalahamd/MyRestProjects/akbariProjeleri/TaxiProje/iceland-taxi-&-tours/public/favicon.ico'

    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found.")
        return

    try:
        img = Image.open(source_path)
        img = img.convert("RGBA")
        
        # Get the bounding box of the non-transparent pixels
        # getbbox() returns the bounding box of non-zero regions in the image.
        # For RGBA, this works well if the background is transparent (alpha 0).
        bbox = img.getbbox()
        
        if bbox:
            print(f"Original Size: {img.size}")
            print(f"Cropping to bbox: {bbox}")
            cropped_img = img.crop(bbox)
            
            # Additional check: Sometimes getbbox isn't tight enough if there are stray nearly-transparent pixels.
            # But usually it's correct for alpha=0.
            # Let's save this tight crop.
            cropped_img.save(logo_dest_path)
            print(f"Saved cropped logo to {logo_dest_path} with size {cropped_img.size}")
            
            # For favicon, we want the icon part.
            # Assuming the logo is wide (Icon + Text), and icon is on the left.
            # We will take the left square of the CROPPED image.
            
            width, height = cropped_img.size
            if width > height:
                # Wide logo
                # Heuristic: Take the leftmost square equal to height.
                # However, let's try to be smarter. 
                # If the user said "crop it properly", maybe they meant the favicon too.
                # Let's take the first 'height' pixels from the left.
                icon_chunk = cropped_img.crop((0, 0, height, height))
                
                # Now crop THAT chunk to remove any whitespace causing it to be off-center
                icon_bbox = icon_chunk.getbbox()
                if icon_bbox:
                    icon_final = icon_chunk.crop(icon_bbox)
                else:
                    icon_final = icon_chunk
            else:
                # Square or tall logo, just use it
                icon_final = cropped_img

            # Resize to standard favicon sizes
            icon_final = icon_final.resize((64, 64), Image.Resampling.LANCZOS) 
            icon_final.save(favicon_dest_path, format='ICO', sizes=[(64, 64), (32, 32), (16, 16)])
            print(f"Saved favicon to {favicon_dest_path}")
            
        else:
            print("Image appears to be empty or fully transparent.")

    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == '__main__':
    process_images()
