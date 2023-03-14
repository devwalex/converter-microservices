# converter-microservices
This microservice is used for converting MP4 video files to MP3 audio files and consists of the following services:

- Auth Service
- Converter Service
- Notification Service
- API Gateway

### Auth Service
This service manages user authentication, which includes registration, login, and token validation.

### Converter Service
The purpose of this service is to convert MP4 video files to MP3 audio files, utilizing the FFmpeg library.

### Notification Service
This service sends an email notification to the user after a file has been successfully converted.

### API Gateway
This service serves as a connection point between the client and other services, acting as an intermediary.



**This service architecture employs `RABBITMQ` as a message broker for internal communication between services.**


## Architecture
Here is an overview of the microservices architecture:

![architecture diagram](architecture.png)

- After registering, users must log in to obtain an authentication token.
- This token is required to access the upload video endpoint.
- When a user hits the upload endpoint, the API gateway verifies the validity and expiration status of the token.
- If the token is valid, the video is uploaded to MongoDB GridFS, and a message is sent to the videos queue.
- The converter services then receive the message from the videos queue, convert the video to audio, and upload the audio to MongoDB GridFS.
- Next, the converter services send a message to the audios queue.
- Finally, the notification services receive the message from the audios queue and notify the user with a download link for the audio file.


## General setup

1. Prerequisites    
    Make sure you have the following installed on your machine
    - nodejs
    - kubectl
    - minikube
    - docker
    - mongodb
    - mysql

2. Clone the repo

    ```
    git clone https://github.com/devwalex/converter-microservices
    ```

3. Set up environment variables for each service

    ```
    cp .env.example .env
    ```
4. Run migration for auth service

    ```
    cd auth
    npm run migrate
    ```
5. Start minikube and minikube tunnel
    ```
    minikube start
    minikube tunnel
    ```
6. Start all the services
    ```
    kubectl apply -f ./auth/manifests
    kubectl apply -f ./gateway/manifests
    kubectl apply -f ./converter/manifests
    kubectl apply -f ./notificaton/manifests
    kubectl apply -f ./rabbitmq/manifests
    ```
7.  Add the gateway and rabbitmq manager domain to your etc/hosts file

    ```js
        127.0.0.1 videotoaudio.com
        127.0.0.1 rabbitmq-manager.com
    ```
    Add these 👆 lines of code to your /etc/hosts file.

    ```
    nano /etc/hosts
    ```
    This will enable you to access the domain locally on your browser.

8.  Check if all the service is created
    ```
    kubectl get services
    ```
9.  Access the gateway and rabbitmq manager URL from your machine

    http://videotoaudio.com

    http://rabbitmq-manager.com (username - guest, password - guest)

10. API documentation

    https://documenter.getpostman.com/view/5916628/2s93JuuigU

## Author
Usman Salami

## License
MIT