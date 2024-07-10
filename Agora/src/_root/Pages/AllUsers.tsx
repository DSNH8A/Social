import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";


const AllUsers = () => {

  const {data: users, isLoading: isUserLoading, isError: isErrorUsers} = useGetUsers(10);

  if(isErrorUsers)
  {
    return(
      <div className="flex flex-1">
        <div className="flex flex-row justify-center">
          <p>Something wenr wrong</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex content-center w-full">
        <h2>Users to follow</h2>
        {isUserLoading && !users ?(
          <Loader/>
        ) :(
            <ul>
              {users?.documents.map((user) => (
              <li key={user?.$id}>
              <UserCard user={user} />
              </li>
          ))}
            </ul>
        )}
      </div>
    </div>
  )
}

export default AllUsers
