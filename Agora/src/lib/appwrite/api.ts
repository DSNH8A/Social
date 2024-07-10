import { INewPost, INewUser, IUpdatePost, IUpdateUser, IUser } from '../../types/index'
import { ID, ImageGravity, Models, Query } from 'appwrite'
import { account, appwriteConfig, avatars, databases, storage } from '../../lib/appwrite/config'

export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if (!newAccount) throw Error

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB(
            {
                accountID: newAccount.$id,
                name: newAccount.name,
                email: newAccount.email,
                userName: user.username,
                imgaeUrl: avatarUrl,

            }
        );

        return newUser;
    }
    catch (error) {
        console.log(error);
        return error;
    }
}


export async function saveUserToDB(user: {
    accountID: string;
    email: string;
    name: string;
    imgaeUrl: URL;
    userName?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        );

        return newUser;
    }
    catch (error) {
        console.log(error);
    }
}


export async function signInAccount(user: { email: string; password: string; }) {
    try {
        const session = await account.createEmailPasswordSession(user.email, user.password);
        return session;
    }

    catch (error) {
        console.log(error);
        console.log("invalid credentials");
    }
}

export async function getAccount() {
    try {
        const currentAccount = await account.get();

        return currentAccount;
    } catch (error) {
        console.log(error);
        console.log("jelenleg nincs bejelentkezett felhasználó");
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await getAccount();

        if (!currentAccount) {
            console.log("nincs senki bejelentkezve");
            throw Error;
        }

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,

            [Query.equal('accountID', currentAccount.$id)]
        )


        if (!currentUser) {
            console.log("nem sikerült currentuser-t csinálni");
            throw Error
        }

        return currentUser.documents[0];
    }
    catch (error) {
        console.log(error);
    }
}


export async function signOutAccount() {
    try {
        const session = await account.deleteSessions();

        return session;
    }

    catch (error) {
        console.log("cant delete session");
        console.log("nincs senki bejelentkezve");
        console.log(error);
    }
}

export async function createPost(post: INewPost) {
    try {
        // Upload file to appwrite storage
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw Error;

        // Get file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        // Convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // Create post
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageID: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        return newPost;
    } catch (error) {
        console.log(error);
    }
}

export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );

        return uploadedFile;
    }
    catch (error) {
        console.log(error);
    }
}

export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            ImageGravity.Top,
            100,
        )

        return fileUrl;
    }

    catch (error) {
        console.log(error);
    }
}

export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return { status: 'ok' }
    }
    catch (error) {
        console.log(error);
    }
}

export async function getRecentPosts() {

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(20)]
        )

        if (!posts) throw Error

        return posts;
    }

    catch (error) {
        console.log(error);
    }
}

export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )

        if (!updatedPost) throw Error;

        return updatedPost;
    }
    catch (error) {
        console.log(error)
    }
}

export async function savePost(postId: string, userId: string) {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                users: userId,
                post: postId,
            }
        )

        if (!updatedPost) throw Error;

        return updatedPost;
    }
    catch (error) {
        console.log(error)
    }
}


export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )

        if (!statusCode) throw Error;

        return { status: 'ok' };
    }
    catch (error) {
        console.log(error)
    }
}


export async function getPostById(postId: string) {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )
        return post;
    }
    catch (error) {
        console.log(error);
    }
}

export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;

    try {
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        }

        if (hasFileToUpdate) {
            // Upload file to appwrite storage
            const uploadedFile = await uploadFile(post.file[0]);
            if (!uploadedFile) throw Error;

            // Get file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }


            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
        }


        // Convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // Create post
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags,
            }
        );

        if (!updatedPost) {
            await deleteFile(post.imageId);
            throw Error;
        }

        return updatePost;
    } catch (error) {
        console.log(error);
    }
}

export async function deletePost(postId: string, imageId: string) {
    if (postId || imageId) throw Error

    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )

        return { status: 'ok' }
    }

    catch (error) {
        console.log(error);
    }

}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]

    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()))
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        )

        if (!posts) throw Error;

        return posts;
    }

    catch (error) {
        console.log(error);
    }
}

export async function searchPosts(searchTerm: string) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)]
        )

        return posts;
    }

    catch (error) {
        console.log(error);
    }
}

export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];

    if (limit) {
        queries.push(Query.limit(limit));
    }

    try {
        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            queries
        );

        if (!users) throw Error;

        const excludedItem = await getCurrentUser();
        for (let i = 0; i < users.documents.length; i++) {
            if (users.documents[i].$id === excludedItem?.$id) {
                continue;
            }

            users.documents.fill(users.documents[i]);
            users.documents = Array.from(new Set(users.documents))

        }

        return users;
    } catch (error) {
        console.log(error);
    }
}

export async function getUserById(id: string) {
    try {
        const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            id
        )

        if (!user) throw Error;

        return user;
    }
    catch (error) {
        console.log(error);
    }
}

/**
 * UpdatesUser
 * @param user 
 * @returns new user
 */
export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;

    try {

        let image = {
            imageUrl: user.imageUrl,
            imageId: user.imageId,
        };


        if (hasFileToUpdate) {
            // Upload new file to appwrite storage
            const uploadedFile = await uploadFile(user.file[0]);
            if (!uploadedFile) throw Error;

            // Get new file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
        }

        const updatedUser = databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            user.userId,
            {
                name: user.name,
                bio: user.bio,
                imageId: user.imageId,
                imageUrl: user.imageUrl,
                file: user.file
            }
        )

        if (!updatedUser) throw Error;

        return updatedUser;
    }
    catch (error) {
        console.log(error);
    }
}