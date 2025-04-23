import React from 'react'

const page = () => {
  return (
    <>
    <section>
      <div className='flex flex-col gap-4'>
        <div className='text-lg font-bold mt-6'>
          <h1>Sunday, 23 May</h1>
        </div>
        <div className='flex flex-row gap-2 justify-around items-center'>
          <div className='text-center'>
            <p className='text-sm'>Mon</p>
            <h1 className='font-bold'>20</h1>
          </div>
          <div className='text-center'>
            <p className='text-sm'>Tue</p>
            <h1 className='font-bold'>20</h1>
          </div>
          <div className='text-center'>
            <p className='text-sm'>Wed</p>
            <h1 className='font-bold'>20</h1>
          </div>
          <div className='text-center bg-blue-100 rounded-xl p-2'>
            <p className='text-sm'>Thu</p>
            <h1 className='font-bold'>20</h1>
          </div>
          <div className='text-center'>
            <p className='text-sm'>Fri</p>
            <h1 className='font-bold'>20</h1>
          </div>
          <div className='text-center'>
            <p className='text-sm'>Sat</p>
            <h1 className='font-bold'>20</h1>
          </div>
          <div className='text-center'>
            <p className='text-sm'>Sun</p>
            <h1 className='font-bold'>20</h1>
          </div>
        </div>
      </div>
    </section>

    <section className='mt-6'>
      <div>
        <h1 className='font-bold'>Academic Schedule</h1>
      </div>
    </section>
    </>
  )
}

export default page
