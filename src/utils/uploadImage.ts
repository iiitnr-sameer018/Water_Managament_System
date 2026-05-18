import { supabase } from "../supabaseClient";

export const uploadImage = async (file: File) => {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${Date.now()}-${sanitizedName}`;

  const { error } = await supabase.storage
    .from("complaints")
    .upload(fileName, file);

  if (error) {
    console.error("Supabase storage upload error:", error);
    throw new Error(error.message || "Failed to upload image");
  }

  const { data } = supabase.storage
    .from("complaints")
    .getPublicUrl(fileName);

  return data.publicUrl;
};
