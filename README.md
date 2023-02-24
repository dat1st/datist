# datist

## Overview

Datist is a project designed to help researchers conduct forensic analysis of HTTP requests, cookies, headers, local and session storage in a user-friendly way. The project consists of two main components: a website and a Chrome extension. The website provides a central hub for users to analyze data and visualize results, while the Chrome extension enables users to easily capture data from their browser and send it to the website for analysis.

## MUST READ:

- **DO NOT USE THIS PROJECT FOR ILLEGAL PURPOSES.**
- **VIOLATING THE PRIVACY OF OTHERS IS ILLEGAL, UNETHICAL AND WRONG.**
- **THIS PROJECT IS FOR RESEARCH PURPOSES ONLY.**

## PLEASE NOTE:

- **AS THE SERVER IS IN ONGOING DEVELOPMENT, DATA MAY BE WIPED AT ANY TIME.**

## Current state

- [x] Basic chrome extension
- [x] Basic collector server
- [x] Basic user/thread creation flow
- [ ] Finalize stable contract for data structures on the server side
- [ ] Provide more fine grained control over data collection
- [ ] Add configuration options to threads on the website
- [ ] Visualize "journeys" by combining multiple requests into a single graph, i.e. within a time window and structured data like referrer, etc.
- [ ] Automatic deletion of data after a certain time period
- [ ] Encryption of data on the client side preventing the server from seeing the data

Ideas for more data to collect:

- [ ] plugins
- [ ] extensions
- [ ] history
- [ ] bookmarks
- [ ] downloads
- [ ] cache
- [ ] passwords
- [ ] autofill
- [ ] website icons
- [ ] mouse and keyboard activity
- [ ] advertisements
- [ ] social media accounts

## Features

- **HTTP Request Analysis:** Datist enables users to analyze HTTP requests and extract data such as headers, cookies, and parameters.
- **Cookie Analysis:** Datist can extract, analyze, and visualize cookie data to help researchers understand user behavior and preferences.
- **Header Analysis:** Datist can analyze and extract header data to help researchers understand the type of browser or device being used.
- **Local and Session Storage Analysis:** Datist can extract and analyze data stored in the browser's local and session storage, which can be helpful in understanding user behavior and preferences.
- **Chrome Extension:** The Datist Chrome extension enables users to easily capture data from their browser and send it to the website for analysis.
- **Data Visualization:** Datist provides a variety of tools for visualizing data, including graphs, tables, and charts.

## Installation

### Website

To use the Datist website, simply visit [https://dat.ist](https://dat.ist) in your web browser.

### Chrome Extension

To install the datist Chrome extension, follow these steps:

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) and search for \"datist\".
2. Click the \"Add to Chrome\" button to install the extension.
3. Once the extension is installed, you will see a small icon in the top right corner of your browser.

## Usage

### Website

To use the Datist website, simply log in and start analyzing data. You can upload files, paste data directly into the website, or use data captured with the Chrome extension.

### Chrome Extension

To use the Datist Chrome extension, follow these steps:

1. Open the list of extensions in your browser.
2. Click the \"Datist\" extension.
3. Open the extension options.
4. Configure your user_id and thread_id.
5. Datist will automatically start sending data to the website.

## License

Datist is conditionally licensed under the [MIT License](LICENSE). This license is NOT granted if you do NOT adhere to your responsibilities as outlined in the privacy policy. DO NOT use this project for illegal purposes. Violating the privacy of others is illegal, unethical and wrong. This project is for research purposes only. We will not be held responsible for any illegal activity conducted using this project.
