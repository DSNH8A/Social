import {Button} from "@/components/ui/button"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel,FormMessage,} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SignupValidation } from "@/lib/validation"
import {z} from "zod";
import '../../globals.css'
import Loader from '../../components/shared/Loader'
import {Link, Navigate, useNavigate} from 'react-router-dom'
import { createUserAccount } from "@/lib/appwrite/api"
import { useToast } from "@/components/ui/use-toast"
import { useCreateUserAccountMutation, useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"


const SignupForm = () => {

  const {toast} = useToast();
  
  const {checkAuthUser, isLoading: isUserLoading} = useUserContext();
 
  const navigate = useNavigate();
 
   // 1. Define your form.
   const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name : "",
      username: "",
      email : "",
      password : "",
    },
  });

  const {mutateAsync : createUserAccount, isPending : isCreatingAccount} = useCreateUserAccountMutation();

  const {mutateAsync : signInAccount, isPending : isSigningIn} =useSignInAccount();

 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const newUser = await createUserAccount(values);

    if(!newUser)
      {
        return toast({
          title: "Sign up failed. Please Try again."
          
        })
      }

      const session = await signInAccount({
        email: values.email,
        password: values.password,
      })

      if(!session)
        {
          return toast({title: 'Sign failed. Please try again.'})
        }

        const isLoggedIn = await checkAuthUser();

        if(isLoggedIn)
        {
          form.reset();

          navigate('/');
        }
        else
        {
          return toast({title: 'Sign up failed. Please try again.'});
        }
  }

  return (
     <Form {...form}>
        <div className="sm:w-420 flex-center flex-col flex">
          <img src="public/assets/logo.svg" alt="logo"/>
          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
            Create a new Account
          </h2>
          <p className="text-light-3 small-medium md:base-regular mt-2">
            To use te app enter your account details.
          </p>
      
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full gap-5 mt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
              <FormLabel>UserName</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button-primary">
          {
            isCreatingAccount ? (
              <div className="flex-center gap-2">
                <Loader/>Loading...
              </div>
            ): "Sign up"
          }
          </Button>
          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account?
            <Link to="/sign-in" className="text-primary-500 text-small-semibold ml-1">Login</Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SignupForm
