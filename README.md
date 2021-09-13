# Example of a notification service with Node.js, Fastify, and AWS SES

This is an example of a notification service built with Node.js, [Fastify](https://fastify.io), and [AWS SES](https://aws.amazon.com/ses), created for an article on the [Courier blog](https://www.courier.com/blog).

## App architecture

![Notification service architecture](https://user-images.githubusercontent.com/40777040/133071546-9921e590-c0ea-44bc-a81f-43772d93da57.png)


## Running this app locally

1. Clone the repo.
2. In the project directory, install all dependencies:

       npm install

3. Start the development server:

       npm run dev

4. Query the notification endpoint (or any other endpoint):

       curl -X POST \
        -H 'Content-Type: application/json' \
        -H 'Accept: application/json' \
        -d '{"userId": 123, "event": "migration-confirmed"}' \
        localhost:3000/notify
