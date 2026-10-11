# VastuVerse

A responsive educational website exploring **Vastu Shastra** as part of **Indian Knowledge Systems (IKS)**. Built with HTML, CSS, and vanilla JavaScript for a college project and beginner-friendly demonstration.

## Features

- **Responsive website layout** designed for desktop, tablet, and mobile screens.
- **Vastu direction explorer** with interactive direction information.
- **Digital compass** that attempts to use supported device-orientation sensors and offers a manual direction option where available.
- **Interactive 3×3 house planner** for exploring traditional room-placement suggestions.
- **VastuBot** that searches the local JSON knowledge database for matching topics, keywords, questions, and answers.
- **Contact form demonstration** for showing front-end form interaction.

## Project files

```text
VastuVerse/
├── index.html           # Page structure and embedded CSS styles
├── script.js            # Interactive features and chatbot logic
├── vastu-database.json  # Searchable Vastu topics, keywords, and answers
└── README.md            # Project documentation
```

## Run the website locally

The chatbot loads `vastu-database.json` using JavaScript `fetch()`. For that reason, open the project through a local web server rather than opening `index.html` directly with a `file://` URL.

### Option 1: VS Code Live Server

1. Extract the project ZIP file.
2. Open the `VastuVerse` folder in Visual Studio Code.
3. Install the **Live Server** extension if it is not already installed.
4. In the Explorer panel, right-click `index.html`.
5. Select **Open with Live Server**.
6. Your browser should open the website at a local address, commonly similar to `http://127.0.0.1:5500/`.

### Option 2: Python local server

If Python is installed, open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## Updating the VastuBot knowledge base

Edit `vastu-database.json` in a text editor. Preserve valid JSON syntax: use double quotes around keys and string values, and do not add trailing commas. Add new topics or answers using the same structure as the existing entries. Refresh the website after saving the file.

If the chatbot cannot find a topic, try a simpler keyword that appears in the database. Search results depend on the keywords and matching logic defined in `script.js`.

## Digital compass notes

Compass functionality depends on the browser, device hardware, and permission settings. Some browsers require a secure context (HTTPS or localhost) and explicit permission for motion/orientation sensors. If sensor readings are unavailable or inaccurate, use the manual direction control. A browser-based compass is not a precision navigation instrument.

## Important project notes

- The contact form is a **front-end demonstration**. It does not send messages or store submissions on a server unless a backend service is added.
- Vastu Shastra recommendations are presented for educational exploration of traditional beliefs and practices. They should not be interpreted as scientifically guaranteed outcomes or as a substitute for professional architectural, structural, electrical, or safety advice.
- This project uses plain HTML, CSS, and JavaScript. It does not require a package manager or external JavaScript framework.

## Customization

- **Visual design and page content:** edit `index.html`.
- **Interactions, planner, compass, and chatbot behavior:** edit `script.js`.
- **Topics, keywords, questions, and answers:** edit `vastu-database.json`.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- JSON
