
import Image from "next/image"
import ProfileImg2 from './assets/ProfileImg2.jpeg'
import { ChatDots, Download, WhatsappFill, Plus } from "akar-icons"
// import float from './global.css'
function page() {
  return (
    <>
      <div className="bg-[#04140D] text-white h-150 flex items-center p-10">
        <div className='flex flex-col gap-5'>
          <h1 className='text-7xl text-green-00 font-extrabold'>Muhammad Masood Sheikh</h1>
          <h2 className='text-4xl mt-7 font-bold text-[#34D399]'>MERN Stack Developer</h2>
          <div className="w-90 h-1 mt-2 bg-linear-to-r from-[#10B981] to-[#34D399]rounded-full"></div>
          <p className='text-white font-[Sans-Serif] text-[20px]  mt-7 font-extralight'>
            I contribute in making of interactive and engaging web and mobile appications.
            Grateful for the engineering concepts that helps me build clean, efficient and optimal solutions.
          </p>
          <div className='flex flex-row gap-6'>

            <button className='border w-40 h-10 bg-[#10B981] font-bold rounded-[10px]
            border-none text-[18px] flex items-center justify-evenly cursor-pointer hover:bg-[#188a61] hover:scale-105 transition-all duration-400
            '>
              <ChatDots />
              Contact me</button>
            <button className='border w-50 border-[#10B981] rounded-[10px] flex justify-around items-center text-[18px] hover:bg-[#188a61] hover:scale-105  transition-all duration-400 cursor-pointer'>
              <Download className="h-5" />
              Download Resume</button>

            <button className='border h-10 w-35 border-[#10B981] rounded-[10px]  flex justify-evenly items-center text-[18px] hover:bg-[#25D366] hover:text-white hover:border-transparent hover:scale-105  transition-all duration-400 cursor-pointer '>
              <WhatsappFill className="h-5" />
              Whatsapp</button>
          </div>


          <div className="flex w-100 justify-between mt-7">
            <div>
              <h3 className="text-4xl flex items-center">
                5 <Plus /></h3>
              <p>Months Experience</p>
            </div>
            <div>
              <h3 className="text-4xl flex items-center">
                10 <Plus /></h3>
              <p>Projects completed</p>
            </div>
          </div>
          <h3></h3>
        </div>
        <div className="relative">
          {/* Top-right badge */}
          <div className="absolute top-2 right-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg animate-[float_3s_ease-in-out_infinite] text-[12px]">
            <p className="text-sm text-gray-300">Specialized in</p>
            <p className="text-[#34D399] font-bold">React & Node.js</p>
          </div>

          {/* Bottom-left badge */}
          <div className="absolute bottom-0 left-0 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg animate-[float_3s_ease-in-out_infinite] text-[12px]">
            <p className="text-sm text-gray-300">Based in</p>
            <p className="text-[#34D399] font-bold">Karachi, Pakistan</p>
          </div>

          <Image src={ProfileImg2} alt="Hero Image" className="w-200 h-100 object-cover rounded-full shadow-lg shadow-[#18805d]" />
        </div>

      </div>
    </>
  )
}

export default page