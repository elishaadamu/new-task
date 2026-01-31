"use client";

import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href={"/"}>
      <Image src={"/images/logos/aydevelopers-BemNdjvJ.png"} alt="logo" />
    </Link>
  );
};

export default Logo;
