import React from 'react';

const Contact = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  function encode(data){
    return Object.keys(data)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');
  }

  function handleSubmit(e){
    e.preventDefault();
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': "application/x-www-form-urlencoded" },
      body: encode({ 'form-name': 'contact', name, email, message }),
    })
    .then(() => alert("Message sent!"))
    .catch((error) => alert(error));
  }

  return (
    <section id='contact' className='relative'>
      <div className='w-full px-5 py-10 mx-auto flex flex-col lg:flex-row'>
        {/* Map & Info */}
        <div className="lg:w-2/3 md:w-full bg-gray-900 rounded-lg overflow-hidden mb-8 lg:mb-0 lg:mr-10 p-10 flex items-end justify-start relative">
          <iframe
            width='100%'
            height='100%'
            title='map'
            className="absolute inset-0"
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
            style={{ filter: "opacity(0.7)" }}
            src="https://maps.google.com/maps?q=Pune,Maharashtra,India&z=14&output=embed"
          />
          <div className='bg-gray-900 relative flex flex-wrap py-6 rounded shadow-md'>
            <div className="lg:w-1/2 px-6 w-full">
              <h2 className='title-font font-semibold text-white tracking-widest text-xs'>ADDRESS</h2>
              <p className='mt-1 text-white'>Pune, Maharashtra, India</p>
            </div>
            <div className='lg:w-1/2 px-6 mt-4 lg:mt-0 w-full'>
              <h2 className='title-font font-semibold text-white tracking-widest text-xs'>EMAIL</h2>
              <a className='text-indigo-400 leading-relaxed break-words'>bhagyashrikhond11@gmail.com</a>
              <h2 className='title-font font-semibold text-white tracking-widest text-xs mt-4'>PHONE</h2>
              <p className='leading-relaxed text-white'>9322128117</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form
          data-netlify="true"
          name="contact"
          onSubmit={handleSubmit}
          className='lg:w-1/3 md:w-full flex flex-col md:ml-auto w-full md:py-8 mt-8 lg:mt-0'
        >
          <h2 className="text-white sm:text-4xl text-3xl mb-1 font-medium title-font">Hire Me</h2>
          <p className="leading-relaxed mb-5 text-gray-300">
            Feel free to contact me for web development projects, collaborations, or any opportunity. I would love to connect and discuss how I can help build modern and responsive web applications.
          </p>
          <div className='relative mb-4 '>
            <label htmlFor='name' className='leading-7 text-sm text-gray-300'>Name</label>
            <input
              type='text'
              id='name'
              name='name'
              className='w-full bg-gray-800 rounded border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 text-base outline-none text-gray-100 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out'
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="email" className="leading-7 text-sm text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full bg-gray-800 rounded border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 text-base outline-none text-gray-100 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="message" className="leading-7 text-sm text-gray-300">Message</label>
            <textarea
              id="message"
              name="message"
              className="w-full bg-gray-800 rounded border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 h-32 text-base outline-none text-gray-100 py-2 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
            />
          </div>
          <button
            type="submit"
            className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;