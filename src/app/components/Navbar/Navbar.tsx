'use client';

import Link from 'next/link';
import React, { Fragment, useEffect, useState } from 'react';
import { UserProfile, useUser } from '@auth0/nextjs-auth0/client';
import {
  Navbar,
  Collapse,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from './../MTailwind';
import { FaChevronDown, FaBars, FaSignOutAlt, FaUser } from 'react-icons/fa';

const menuItems = [
  { label: 'Single', type: 'single' },
  { label: 'Single Quarterfinal', type: 'single-quarterfinal' },
  { label: 'Single Semifinal', type: 'single-semifinal' },
  { label: 'Single Final', type: 'single-final' },
  { label: 'Double', type: 'double' },
  { label: 'Double Semifinal', type: 'double-semifinal' },
  { label: 'Double Final', type: 'double-final' },
];

function ProfileMenu({ user }: { user: UserProfile }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { nickname, name, email } = user;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Menu
      open={isMenuOpen}
      handler={setIsMenuOpen}
      placement="bottom-end"
      allowHover={true}
    >
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          <Avatar
            variant="circular"
            size="sm"
            alt="tania andrew"
            className="border border-gray-900 p-0.5"
            src={user.picture ?? 'favicon.ico'}
          />
          <FaChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1">
        <MenuItem key={'name'} className={`flex items-center gap-2 rounded}`}>
          <FaUser className="h-4 w-4" strokeWidth={2} />
          <Typography as="span" variant="small" className="font-normal">
            Welcome, <br /> {nickname ?? name ?? email ?? ''}
          </Typography>
        </MenuItem>

        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/auth/logout">
          <MenuItem
            key={'logout'}
            onClick={closeMenu}
            className={`flex items-center gap-2 rounded hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10}`}
          >
            <FaSignOutAlt className="h-4 w-4 text-red-500" strokeWidth={2} />
            <Typography
              as="span"
              variant="small"
              className="font-normal"
              color={'red'}
            >
              Logout
            </Typography>
          </MenuItem>
        </a>
      </MenuList>
    </Menu>
  );
}

function TrackerMenu({ closeMobileNav }: { closeMobileNav: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderMenuItems = () =>
    menuItems.map(({ label, type }) => (
      <MenuItem key={type} onClick={closeMobileNav} className={`text-sm`}>
        <Link href={`/match-tracker?type=${type}`}>{label}</Link>
      </MenuItem>
    ));

  return (
    <Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <Typography as="div" variant="small" className="font-medium">
            <ListItem
              className="flex items-center gap-2 py-2 pr-4 font-medium text-black bg-transparent"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              Match Tracker
              <FaChevronDown
                strokeWidth={2.5}
                className={`hidden h-3 w-3 transition-transform lg:block ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
              />
              <FaChevronDown
                strokeWidth={2.5}
                className={`block h-3 w-3 transition-transform lg:hidden ${
                  isMobileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList className="hidden rounded-xl lg:block text-black">
          {renderMenuItems()}
        </MenuList>
      </Menu>
      <div className="block lg:hidden text-black">
        <Collapse open={isMobileMenuOpen}>{renderMenuItems()}</Collapse>
      </div>
    </Fragment>
  );
}

// function RankingMenu({ closeMobileNav }: { closeMobileNav: () => void }) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   return (
//     <Fragment>
//       <Menu
//         open={isMenuOpen}
//         handler={setIsMenuOpen}
//         placement="bottom"
//         allowHover={true}
//       >
//         <MenuHandler>
//           <Typography as="div" variant="small" className="font-medium">
//             <ListItem
//               className="flex items-center gap-2 py-2 pr-4 font-medium text-black bg-transparent"
//               selected={isMenuOpen || isMobileMenuOpen}
//               onClick={() => setIsMobileMenuOpen((cur) => !cur)}
//             >
//               Ranking
//               <FaChevronDown
//                 strokeWidth={2.5}
//                 className={`hidden h-3 w-3 transition-transform lg:block ${
//                   isMenuOpen ? 'rotate-180' : ''
//                 }`}
//               />
//               <FaChevronDown
//                 strokeWidth={2.5}
//                 className={`block h-3 w-3 transition-transform lg:hidden ${
//                   isMobileMenuOpen ? 'rotate-180' : ''
//                 }`}
//               />
//             </ListItem>
//           </Typography>
//         </MenuHandler>
//         <MenuList className="hidden rounded-xl lg:block text-black">
//           <MenuItem onClick={closeMobileNav}>
//             <Link href="/">Single</Link>
//           </MenuItem>
//           <MenuItem onClick={closeMobileNav}>
//             <Link href="/">Double</Link>
//           </MenuItem>
//         </MenuList>
//       </Menu>
//       <div className="block lg:hidden text-black">
//         <Collapse open={isMobileMenuOpen}>
//           <MenuItem onClick={closeMobileNav}>
//             <Link href="/">Single</Link>
//           </MenuItem>
//           <MenuItem onClick={closeMobileNav}>
//             <Link href="/">Double</Link>
//           </MenuItem>
//         </Collapse>
//       </div>
//     </Fragment>
//   );
// }

function NavList({ closeMobileNav }: { closeMobileNav: () => void }) {
  return (
    <List className="mb-6 mt-4 p-0 lg:mb-0 lg:mt-0 lg:flex-row lg:p-1">
      {/* <RankingMenu closeMobileNav={closeMobileNav} /> */}
      <TrackerMenu closeMobileNav={closeMobileNav} />
    </List>
  );
}

export function TableTennisNavbar() {
  const { user, isLoading } = useUser();
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    window.addEventListener(
      'resize',
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const closeMobileNav = () => setOpenNav(false);

  const AuthButton =
    !isLoading && user ? (
      <ProfileMenu user={user} />
    ) : (
      // eslint-disable-next-line @next/next/no-html-link-for-pages
      <a href="/api/auth/login">
        <Button variant="outlined" size="sm" fullWidth>
          Log In
        </Button>
      </a>
    );

  return (
    <div>
      {!isLoading && (
        <Navbar className="sticky h-max max-w-full bg-gray-200 rounded-none px-4 py-2 lg:px-8 lg:py-4">
          <div className="flex items-center justify-between text-black">
            <div className="mr-4 cursor-pointer py-1.5 lg:ml-2 text-xl">
              <Link href="/" passHref>
                <span>Table Tennis Match Tracker</span>
              </Link>
            </div>
            <div className="hidden lg:block ml-auto">
              <NavList closeMobileNav={closeMobileNav} />
            </div>
            <div className="hidden gap-2 lg:flex">{AuthButton}</div>
            <IconButton
              variant="text"
              className="lg:hidden"
              onClick={() => setOpenNav(!openNav)}
            >
              {openNav ? (
                <FaBars className="h-6 w-6" strokeWidth={2} />
              ) : (
                <FaBars className="h-6 w-6" strokeWidth={2} />
              )}
            </IconButton>
          </div>
          <Collapse open={openNav}>
            <NavList closeMobileNav={closeMobileNav} />
            <div className="flex w-full flex-nowrap items-center gap-2 lg:hidden">
              {AuthButton}
            </div>
          </Collapse>
        </Navbar>
      )}
    </div>
  );
}
export default TableTennisNavbar;
