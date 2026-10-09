import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/auth";
import { ALLOWED_TYPES, ICON_TYPES, MAX_ICON_BYTES, MAX_UPLOAD_BYTES } from "@/lib/media";

// Issues short-lived tokens so the admin's browser can upload straight to
// Vercel Blob (large videos never pass through this server). Project work
// goes under projects/, highlight icons under highlights/.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("Not signed in.");
        if (pathname.startsWith("highlights/")) {
          return {
            allowedContentTypes: ICON_TYPES,
            maximumSizeInBytes: MAX_ICON_BYTES,
            addRandomSuffix: true,
          };
        }
        if (!pathname.startsWith("projects/")) throw new Error("Invalid path.");
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
