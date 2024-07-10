
import { Routes, Route } from 'react-router-dom';
import SigninForm from './_auth/Forms/SignInForm'
import { AllUsers, CreatePost, EditPost, Explore, Home, PostDetails, Profile, Saved, UpdateProfile } from './_root/Pages'
import SignupForm from './_auth/Forms/SignupForm'
import AuthLayout from './_auth/AuthLayout';
import { Toaster } from "@/components/ui/toaster"
import RootLayout from './_root/RootLayout';
import LIkedPosts from './_root/Pages/LIkedPosts';
import "./globals.css";

const App = () => {
    return (
        <main>
            <Routes>
                {/* public routes */}

                <Route element={<AuthLayout />}>
                    <Route path="/sign-in" element={<SigninForm />} />
                    <Route path="/sign-up" element={<SignupForm />} />
                </Route>

                {/* private routes */}

                <Route element={<RootLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/all-users" element={<AllUsers />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/update-post/:id" element={<EditPost />} />
                    <Route path="/likedPosts" element={<LIkedPosts />} />
                    <Route path="posts/:id/*" element={<PostDetails />} />
                    <Route path="profile/:id/*" element={<Profile />} />
                    <Route path="/update-profile/:id" element={<UpdateProfile />} />
                </Route>

            </Routes>
            <Toaster />
        </main>
    )
}

export default App