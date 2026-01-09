import json
import os

# Paths
base_dir = r"c:\Users\Kevin\2026-Web-Changes-BER"
json_path = os.path.join(base_dir, "contacts.json")
js_path = os.path.join(base_dir, "contacts.js")
html_path = os.path.join(base_dir, "organization-contacts.html")
output_path = os.path.join(base_dir, "organization-contacts.html") # Overwrite

# 1. Read JSON
with open(json_path, 'r', encoding='utf-8') as f:
    contacts_data = f.read()

# 2. Read JS and Modify
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Replace fetch block with embedded data
# We look for the fetch block patterns
fetch_start = "fetch('contacts.json')"
# We will replace the whole fetch(...).catch(...) block with direct initialization
# It's safer to just rewrite the beginning of the logic since we know the structure.

# Let's splice the JS. 
# We'll remove the fetch part and inject the variable.
# Find where "let allContacts = [];" is defined.
split_marker = "let allContacts = [];"
parts = js_content.split(split_marker)

if len(parts) < 2:
    print("Error: Could not find split marker in JS")
    exit(1)

pre_script = parts[0] + "let allContacts = [];\n"
post_script = parts[1]

# Remove the fetch call from post_script. 
# It starts right after "let allContacts = [];" usually.
# We'll just comment out or replace the fetch block using regex or string find is safer if exact.

# Construct new JS
new_js = f"""
{pre_script}

    // EMBEDDED JSON DATA FOR WORDPRESS
    const CONTACTS_DATA = {contacts_data};

    // Initialize directly
    allContacts = CONTACTS_DATA;
    renderData(allContacts);

    /* 
    // Data Loading Removed for Single File Version
    fetch('contacts.json')
        .then(response => response.json())
        .then(data => {{
            allContacts = data;
            renderData(allContacts);
        }})
        .catch(error => {{
            console.error('Error loading contacts:', error);
            contentArea.innerHTML = `<div style="text-align:center; color: #ef4444; padding: 2rem;">
                                        <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
                                        <p>Failed to load contact data. Please check if 'contacts.json' exists.</p>
                                     </div>`;
        }});
    */

{post_script}
"""

# 3. Read HTML and Inject JS
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Replace <script src="contacts.js"></script> with inline script
script_tag = '<script src="contacts.js"></script>'
if script_tag in html_content:
    final_html = html_content.replace(script_tag, f"<script>\n{new_js}\n</script>")
else:
    # Fallback: Append before body end
    final_html = html_content.replace("</body>", f"<script>\n{new_js}\n</script>\n</body>")

# 4. Write Final HTML
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(final_html)

print(f"Successfully merged files into {output_path}")
