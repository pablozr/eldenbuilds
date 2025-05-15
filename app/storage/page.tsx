import { Metadata } from "next";
import StorageInitializer from "./components/storage-initializer";
import ImageUploader from "./components/image-uploader";
import SupabaseAuthProvider from "../auth/components/supabase-auth-provider";

export const metadata: Metadata = {
  title: "Storage Management",
  description: "Manage your storage settings and upload images",
};

export default function StoragePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Storage Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Storage Status</h2>
          <StorageInitializer />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Image Upload</h2>
          <SupabaseAuthProvider>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Profile Image</h3>
                <ImageUploader 
                  type="profile" 
                  onUploadComplete={(url) => console.log('Profile image uploaded:', url)} 
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Banner Image</h3>
                <ImageUploader 
                  type="banner" 
                  onUploadComplete={(url) => console.log('Banner image uploaded:', url)} 
                />
              </div>
            </div>
          </SupabaseAuthProvider>
        </div>
      </div>
    </div>
  );
}
