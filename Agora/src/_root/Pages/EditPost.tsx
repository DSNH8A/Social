import PostForms from "@/_auth/Forms/PostForms";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { Loader } from "lucide-react";
import { useParams } from "react-router-dom"

const EditPost = () => {

  const {id} = useParams();
  const {data: post, isPending} = useGetPostById(id || '');

  if(isPending) return <Loader/>

    return (
      <div className="flex flex-1">
        <div className="common-container">
          <div className="max-w-5x1 flex-start gap-3 justify-start
          w-full">
            <img src="/assets/add-post.svg"
            width={36}
            height={36}
            alt="add"/>
            <h2 className="h3-bold md:h2-bold text-left w-full">Post</h2>
          </div>
        </div>

        <PostForms action="Update" post={post}/>
      </div>
    )
}

export default EditPost
