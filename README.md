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

## Author
Usman Salami

## License
MIT