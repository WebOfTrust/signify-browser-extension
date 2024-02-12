## Vendor customization guide

As a vendor the first thing required is to host a URL that returns JSON with the following structure and provide the link to the customers.

In this example we have a JSON hosted at following link:

Hosted JSON Link: https://www.npoint.io/docs/d59bd3ab0b31de863a20

API To fetch JSON: https://api.npoint.io/d59bd3ab0b31de863a20

Vendor would provide the API link to their customers.

Following is the JSON structure

```
{
  "title": "Provenant",
  "logo": "https://media.licdn.com/dms/image/C4E0BAQG2_zXeSh-Qdw/company-logo_200_200/0/1663180132032/provenant_inc_logo?e=1715212800&v=beta&t=yINW7CaXVG50h3Ay7vu13OpY4mAu30qpijZwJAe5g-I",
  "icon":"https://cdn-icons-png.flaticon.com/128/3291/3291695.png",
  "theme": {
    "colors": {
      "primary": "#004DB5",
      "secondary": "#F0F6FF",
      "error": "#ec576d",
      "heading": "#004DB5",
      "text": "#333333",
      "subtext": "#004DB5",
      "white": "#ffffff",
      "black": "#373e49",
      "bodyBg": "#FBFBFB",
      "bodyBorder": "#004DB5",
      "bodyColor": "#004DB5",
      "cardColor": "#004DB5",
      "cardBg": "#E4F3FE"
    }
  }
}
```
### title
This attribute is used to indicate the vendor name.

### logo
This attribute is used to indicate the vendor icon.

**title** and **logo** are shown at:
- sign in
  
<img width="304" alt="Screenshot 2024-02-08 at 4 07 21 AM" src="https://github.com/WebOfTrust/signify-browser-extension/assets/19255438/1c310970-6011-48db-98af-f78f4267f4b1">

- top of the sidebar
  
<img width="304" alt="Screenshot 2024-02-08 at 4 07 47 AM" src="https://github.com/WebOfTrust/signify-browser-extension/assets/19255438/97cb45b8-c476-4e8d-a7e3-c3007db9179d">

- heading of content script dialog
  
<img width="350" alt="Screenshot 2024-02-08 at 4 08 08 AM" src="https://github.com/WebOfTrust/signify-browser-extension/assets/19255438/4e491afe-3459-4380-8968-0a5ebdfcc988">

### icon
This attribute is used to set the icon provided by the vendor as extension icon.

### theme
this attribute is the essence of colors (and others e.g. spacing, fonts, etc in the FUTURE) customization. 
To keep it simplistic, the colors are designed to work in a two-tone fashion. 
- **bodyBg** and **bodyColor** have been used for base colors of screens e.g. sign in, sidebar, and content-script dialog. These should be contrasting and complimenting as these are used for background and text respectively.
- **primary** is primarily used for buttons
- **secondary** is used as a contrasting color to make it distinct from **bodyBg**. It is used for the listings and modal background.
- **cardColor** and **cardBg** are used for the list items e.g. identifier card or credential card.
- **heading**, **text**, and **subtext** have been used for label and value pairs on each listing item.

## JSON Theme Annotation

### Sign in
<img width="591" alt="Screenshot 2024-02-08 at 3 23 15 AM" src="https://github.com/WebOfTrust/signify-browser-extension/assets/19255438/b4cec3a0-87c1-4289-aab9-ef31f30f0338">

### Main View
<img width="904" alt="Screenshot 2024-02-08 at 3 23 54 AM" src="https://github.com/WebOfTrust/signify-browser-extension/assets/19255438/85fd434e-aad2-4330-b3f6-b6ddaaf0b9a8">

### Content Script Dialog
<img width="339" alt="Screenshot 2024-02-08 at 3 24 39 AM" src="https://github.com/WebOfTrust/signify-browser-extension/assets/19255438/a2ca3782-19de-47ae-92b1-05f07cdf9afd">

To compare some examples of different vendor JSON customizations, see these links below:
- https://www.npoint.io/docs/1d388b8942c4ec3ed763
- https://www.npoint.io/docs/a75a0383d2820a2153c1
- https://www.npoint.io/docs/d59bd3ab0b31de863a20
  
You can click the 'bin' link at the bottom of those pages to see the raw JSON
