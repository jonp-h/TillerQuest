import NavbarContent from "./NavbarContent";

export default async function Navbar() {
  return (
    <div className="text-lg fixed items-center flex flex-grow-1 p-3 w-screen z-20 bg-background ">
      <NavbarContent />
    </div>
  );
}
