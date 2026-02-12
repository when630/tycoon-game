import os
from PIL import Image

def compress_images(directory, quality=85):
    """
    Compresses all PNG images in the given directory and its subdirectories.
    
    Args:
        directory (str): Path to the directory containing images.
        quality (int): Compression quality (1-100). Default is 85.
    """
    total_savings = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.png'):
                file_path = os.path.join(root, file)
                try:
                    # Get original size
                    original_size = os.path.getsize(file_path)
                    
                    with Image.open(file_path) as img:
                        # Convert to RGB (if RGBA) to allow JPEG conversion? No, we need transparency for game assets.
                        # For PNG, we can use optimize=True and reduce colors if needed, 
                        # but simply saving with optimize=True often helps.
                        # Quantizing to 256 colors (P palette) often saves the most space for sprites 
                        # while maintaining transparency.
                        
                        # Check if already P mode (paletted)
                        if img.mode != 'P':
                            # Quantize to reduce colors and size significantly
                            img = img.quantize(colors=256, method=2) # method 2 = FASTOCTREE
                        
                        img.save(file_path, "PNG", optimize=True)
                    
                    # Get new size
                    new_size = os.path.getsize(file_path)
                    savings = original_size - new_size
                    total_savings += savings
                    
                    if savings > 0:
                        print(f"Compressed {file}: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB (Saved {savings/1024:.1f}KB)")
                    else:
                        print(f"Skipped {file}: No savings")
                        
                except Exception as e:
                    print(f"Error compressing {file}: {e}")

    print(f"\nTotal space saved: {total_savings / (1024*1024):.2f} MB")

if __name__ == "__main__":
    assets_dir = os.path.join(os.getcwd(), 'frontend/public/assets')
    print(f"Compressing images in {assets_dir}...")
    compress_images(assets_dir)
