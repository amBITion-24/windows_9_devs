import base64
import torch

import os
import sys
from PIL import Image
import torch
import numpy as np
from pydantic import BaseModel
import torch
from tqdm import tqdm
from io import BytesIO
from diffusers import StableDiffusionImg2ImgPipeline
import torchvision.transforms as T 

from fast_load import fast_load

class Item(BaseModel):
    prompt: str

os.environ["HUGGINGFACE_HUB_ENABLE_HF_TRANSFER"] = "1"

print("\n\n", file=sys.stderr)
print(("#" * 40), file=sys.stderr)
print("Starting main.py", file=sys.stderr)
print(("#" * 40), file=sys.stderr)
print("\n\n", file=sys.stderr)

model_path = "runwayml/stable-diffusion-v1-5"

pipe_img2img = StableDiffusionImg2ImgPipeline.from_pretrained(
    model_path,
    revision="fp16", 
    torch_dtype=torch.float16,
)
pipe_img2img = pipe_img2img.to("cuda")

model = fast_load(model_id=model_path, load_weights_func=pipe_img2img, faster=True)

# Image preprocessing
def preprocess(image):
    w, h = image.size
    w, h = map(lambda x: x - x % 32, (w, h))  # resize to integer multiple of 32
    image = image.resize((w, h), resample=Image.LANCZOS)
    image = np.array(image).astype(np.float32) / 255.0
    image = image[None].transpose(0, 3, 1, 2)
    image = torch.from_numpy(image)
    return 2.0 * image - 1.0

# Model process execution
def model_run(b64_source):
    to_pil = T.ToPILImage()
    image_data=b64_source
    init_image=base64.b64decode(image_data)
    init_image = Image.open(BytesIO(init_image)).convert('RGB')
    resize = T.transforms.Resize(512)
    center_crop = T.transforms.CenterCrop(512)
    init_image = center_crop(resize(init_image))
    def pgd(X, model, eps=0.1, step_size=0.015, iters=40, clamp_min=0, clamp_max=1, mask=None):
        X_adv = X.clone().detach() + (torch.rand(*X.shape)*2*eps-eps).cuda()
        pbar = tqdm(range(iters))
        for i in pbar:
            actual_step_size = step_size - (step_size - step_size / 100) / iters * i  

            X_adv.requires_grad_(True)

            loss = (model(X_adv).latent_dist.mean).norm()

            pbar.set_description(f"[Running attack]: Loss {loss.item():.5f} | step size: {actual_step_size:.4}")

            grad, = torch.autograd.grad(loss, [X_adv])
            
            X_adv = X_adv - grad.detach().sign() * actual_step_size
            X_adv = torch.minimum(torch.maximum(X_adv, X - eps), X + eps)
            X_adv.data = torch.clamp(X_adv, min=clamp_min, max=clamp_max)
            X_adv.grad = None    
            
            if mask is not None:
                X_adv.data *= mask
                
        return X_adv
    with torch.autocast('cuda'):
        X = preprocess(init_image).half().cuda()
        adv_X = pgd(X, 
                    model=model.vae.encode, 
                    clamp_min=-1, 
                    clamp_max=1,
                    eps=0.03, # The higher, the less imperceptible the attack is 
                    step_size=0.02, # Set smaller than eps
                    iters=70, # The higher, the stronger your attack will be
                )
        
        # convert pixels back to [0,1] range
        adv_X = (adv_X / 2 + 0.5).clamp(0, 1)

    adv_image = to_pil(adv_X[0]).convert("RGB")

    # Convert the image to base64
    buffered = BytesIO()
    adv_image.save(buffered, format="JPEG")
    base64_adv_image = base64.b64encode(buffered.getvalue()).decode('utf-8')

    # Return the base64 encoded image
    return base64_adv_image

def predict(prompt: str):
    b64=model_run(prompt)
    return b64
