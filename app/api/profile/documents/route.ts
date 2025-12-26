import { withAuth } from "@/lib/api-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import logger from "@/lib/logger";
import { createAuditLog } from "@/services/queries/auth.query";
import { getUserByUserId, getUserProfileById, updateDocument } from "@/services/queries/provider.query";
import { AuthenticatedRequest } from "@/types/auth";
import { NextResponse } from "next/server";
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractPublicId(cloudinaryUrl: string): string | null {
    try {
        // Extract public_id from URL
        // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
        const urlParts = cloudinaryUrl.split('/upload/');
        if (urlParts.length < 2) return null;

        const pathWithVersion = urlParts[1];
        // Remove version number (v1234567890/)
        const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, '');
        // Remove file extension
        const publicId = pathWithoutVersion.replace(/\.[^.]+$/, '');

        return publicId;
    } catch (error) {
        console.error('Error extracting public_id:', error);
        return null;
    }
}
export const POST = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const formData = await req.formData();
        const documentType = formData.get('documentType') as string;
        const file = formData.get('file') as File;
        if (!file) {
            return NextResponse.json({
                success: false,
                message: 'No file uploaded'
            }, { status: 400 });
        }

        let allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        let allowedTypeMsg = "JPEG and PNG"
        const isAvatar = documentType === 'avatar';
        if (!isAvatar) {
            allowedTypes = [...allowedTypes, 'application/pdf'];
            allowedTypeMsg = "JPEG, PNG, and PDF"
        }
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                success: false,
                message: `Invalid file type. Only ${allowedTypeMsg} files are allowed.`
            }, { status: 400 });
        }

        const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                success: false,
                message: 'File size exceeds the 1MB limit.'
            }, { status: 400 });
        }

        const uploadDir = isAvatar ? 'documents/avatars' : 'documents';


        const timestamp = Date.now();
      
        const fileName = `${req.user.userId}_${documentType}_${timestamp}`;
     

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await uploadToCloudinary(
            buffer,
            uploadDir, // folder name
            fileName // filename without extension
        ) as any;



        const profile = await getUserProfileById(req.user.userId);
        const user = await getUserByUserId(req.user.userId);
        if (!profile) {
            return NextResponse.json({
                success: false,
                message: 'User profile not found'
            }, { status: 404 });
        }
        //delete old avatar file if exists
        // if (isAvatar && user && user.avatar) {
        //     // Extract public_id from Cloudinary URL
        //     // Example URL: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/documents/avatars/filename.jpg
        //     const publicId = extractPublicId(user.avatar);

        //     if (publicId) {
        //         try {
        //             await uploadToCloudinary.uploader.destroy(publicId);
        //         } catch (error) {
        //             console.error('Failed to delete old avatar from Cloudinary:', error);
        //         }
        //     }
        // }
        // await updateDocument(req.user.userId, fileUrl, documentType as 'certificate' | 'idDocument' | 'avatar', profile.certificates);
        await updateDocument(req.user.userId, result.secure_url, documentType as 'certificate' | 'idDocument' | 'avatar', profile.certificates);
        // Audit Log
        await createAuditLog(req, req.user.userId, 'DOCUMENT_UPLOADED', 'Profile', { documentType: fileName }, profile.id);

        return NextResponse.json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                fileUrl: result.secure_url
            }
        });
    }
    catch (error) {
        if (error instanceof Error) { logger.error("POST /api/profile/documents - " + error.message); }
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
})


