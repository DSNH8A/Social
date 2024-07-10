import { sidebarLinks } from '@/constants';
import { useUserContext } from '@/context/AuthContext';
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations'
import { link } from 'fs';
import { useEffect } from 'react';
import {Link, NavLink, useNavigate, useLocation} from 'react-router-dom'
import { Button } from '../ui/button';
import { INavLink } from '@/types';


const LeftSideBar = () => {

  const {mutate: signOut, isSuccess} = useSignOutAccount();
  const navigate = useNavigate();
  const {user} = useUserContext();
  const {pathname} = useLocation();

  useEffect(()=>{
    if(isSuccess)
    {
      navigate(0);
    }

  },[isSuccess])

  return (
    <nav className="hidden md:flex px-6 py-10 flex-col justify-between min-w-[270px] bg-dark-2 height-[100%]">
      <div className ="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <img
          src="/assets/logo.svg"
          alt="logo"
          width={170}
          height={36}/>
        </Link>

        <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
          <img src={user.imageUrl || "assets/profile-placeholder.svg"}
          alt="profile"
          className='h-14 w-14 rounded-full'/>
          <div className="flex flex-col">
            <p className="body-bold">
              {user.name}
            </p>
            <p className="small-regular text-light-3">
              @{user.username}
            </p>
          </div>
        </Link>

        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;
            return(
              <li key={link.label} className={`${isActive && 'bg-primary-500'} leftsidebar-link group`}>
                 <NavLink to={link.route} className="flex gap-4 items-center p-4">
                  <img src={link.imgURL}
                  alt={link.label}
                  className={ ` group-hover:invert-white ${isActive && 'invert-white'}`}/>
                </NavLink>
                {link.label}
              </li>
            )
          })}
        </ul>
      </div>

      <Button variant="ghost"
      className="shad-button_ghost" onClick={() => signOut()}>
          <img src="/assets/logout.svg"
          alt="logout"/>
          <p className='small-medium lg:base-medium'
          >Log out</p>
      </Button>
    </nav>
  )
}

export default LeftSideBar
