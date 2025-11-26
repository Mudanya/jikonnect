import { withAuth } from "@/lib/api-auth";
import logger from "@/lib/logger";
import { AuthenticatedRequest } from "@/types/auth";
import { existsSync } from "fs";
import { NextResponse } from "next/server";
import { join } from "path";
import { mkdir, unlink, writeFile } from "fs/promises";
import { getUserByUserId, getUserProfileById, updateDocument } from "@/services/queries/provider.query";
import { createAuditLog } from "@/services/queries/auth.query";

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

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents', isAvatar ? 'avatars' : '');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const fileName = `${req.user.userId}_${documentType}_${timestamp}.${extension}`;
        const filePath = join(uploadDir, fileName);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/documents/${isAvatar ? 'avatars/' : ''}${fileName}`;

        const profile = await getUserProfileById(req.user.userId);
        const user = await getUserByUserId(req.user.userId);
        if (!profile) {
            return NextResponse.json({
                success: false,
                message: 'User profile not found'
            }, { status: 404 });
        }
        //delete old avatar file if exists
        if (isAvatar && user && user.avatar) {
            const oldAvatarPath = join(process.cwd(), 'public', user.avatar);

            if (existsSync(oldAvatarPath)) {

                await unlink(oldAvatarPath);

            }
        }
        await updateDocument(req.user.userId, fileUrl, documentType as 'certificate' | 'idDocument' | 'avatar', profile.certificates);
        // Audit Log
        await createAuditLog(req, req.user.userId, 'DOCUMENT_UPLOADED', 'Profile', { documentType: fileName }, profile.id);

        return NextResponse.json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                fileUrl
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


