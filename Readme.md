# Afrachin upload helper
This service is used to manage uploads as the backend (trpc) running on nextjs lacks the capability to handle such requests

## Routes
### POST /upload
This route is used to create an upload id for the users to upload files to.

#### Input
1. `X-Access-Token` in headers
2. `filename` in body

#### Output
```json
{
    "success": true,
    "message": "Created Upload ID",
    "id": "39cfd164-cd8d-405f-9692-ceace5700678"
}
```

### POST /upload/:uploadId
This route is used to let people upload files.

#### Input
1. `uploadId` in URL
2. `file` in body

#### Output
```json
{
    "success": true,
    "message": "File uploaded successfully",
    "url": "https://example.s3.ir-thr-at1.arvanstorage.ir/uploads/497fcf5a-ea4b-4d61-9f8b-e8faad1a7eea.png"
}
```