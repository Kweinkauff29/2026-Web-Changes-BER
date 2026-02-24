import re

with open('2024SEA.html', 'r') as f:
    template = f.read()

with open('final_snippet.html', 'r') as f:
    winners_snippet = f.read()

# Replace 2024 with 2025 in text content
new_html = template.replace('2024', '2025')

# Find the brokerages container
# The brokerages div starts at <div class="brokerages">.
# We want to replace the ENTIRE content of that div with our snippet.
# However, the 2024 page has brokerages at line 1912.
# And we also want to remove the redundant tier images at line 1826.

content_pattern = r'(<div class="brokerages">).*?(<!-- Add more brokerages and winners here -->)'
new_html = re.sub(content_pattern, r'\1\n' + winners_snippet + r'\n      \2', new_html, flags=re.DOTALL)

# Remove the redundant images at 1826-1832 if they exist
redundant_images_pattern = r'<div class="row">\s*<img style="margin: 20px auto 20px auto; object-fit: contain;"\s*src="https://www.bonitaesterorealtors.com/wp-content/uploads/2023/03/Diamond-20-million-Sales-or-75-Sides.png".*?</div>'
new_html = re.sub(redundant_images_pattern, '', new_html, flags=re.DOTALL)

with open('2025SEA.html', 'w') as f:
    f.write(new_html)
