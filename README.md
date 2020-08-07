# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

- /urls, the main page. This is its look when not logged in.
!["Main page when not logged in"](https://github.com/barbmich/tinyapp/blob/master/docs/urls-page.png)
- The login page! If you don't have an account yet, there's a link to the registration form.
!["Login page"](https://github.com/barbmich/tinyapp/blob/master/docs/login-page.png)
- The list of short URLs created by you, available once logged in.
!["List of own links"](https://github.com/barbmich/tinyapp/blob/master/docs/own-links.png)
- Each link has their own page where the short URL can be found, and a form to update their destination
!["short URL page"](https://github.com/barbmich/tinyapp/blob/master/docs/single-link.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.