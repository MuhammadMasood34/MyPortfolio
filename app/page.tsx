
import Image from "next/image"
import ProfileImg2 from './assets/ProfileImg2.jpeg'
function page() {
  return (
    <>
      <div className="bg-blue-500 text-white h-90 flex items-center p-10 ">
        <div className='flex flex-col'>
          <h1 className='text-7xl'>Muhammad Masood Sheikh</h1>
          <h2 className='text-4xl mt-7'>MERN Stack Developer</h2>
          <p className='text-white font-[Sans-Serif] text-2xl font-semibold mt-7 '>
            Feel free to explore my portfolio and get in touch if you have any questions or opportunities.
          </p>
          <div className='grid grid-cols-2 gap-3'>
            <button className='border w-40'>Contact Us</button>
            <button className='border w-40 left-0'>Download Resume</button>
            <button className='border w-40'>Whatsapp</button>
          </div>
        </div>
        <Image src={ProfileImg2} alt="Hero Image" className="w-200 h-130 object-cover rounded-full" />
      </div>
    </>
  )
}

export default page