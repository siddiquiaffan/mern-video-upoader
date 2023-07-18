import { useState } from 'react'
import '@/styles/App.css'

function App() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [video, setVideo] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const isVideo = (type: string) => type.includes("video")

  const handleDrag = function(e: any) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragOver(true);
    } else if (e.type === "dragleave") {
      setIsDragOver(false);
    }
  };


  const handleDrop = function(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    // If dropped items aren't files, reject them
    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) return
    
    // If dropped file is not a video show an alert
    if (!isVideo(e.dataTransfer.files[0].type)) return alert("Only video files are allowed");

    setVideo(e.dataTransfer.files[0])

    return

  };

  const handleChange = (e: any) => {
    // If dropped items aren't files, reject them
    const files = e.target.files
    if (!files || !files[0]) return

    // If dropped file is not a video show an alert
    if (!isVideo(files[0].type)) {
      e.target.value = null
      return alert("Only video files are allowed");
    }

    return setVideo(files[0])
  }

  const containerProps = {
    onDragEnter: handleDrag,
    onDragOver: handleDrag,
    onDragLeave: handleDrag,
    onDrop: handleDrop,
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!video) return alert("Please select a video")
    const proceed = confirm("Are you sure you want to upload this video?")
    if (!proceed) return 
    // return

    // wait 5 seconds before uploading
    setIsUploading(true)
    // await new Promise(resolve => setTimeout(resolve, 5000))

    const formData = new FormData()
    formData.append("video", video)

    try {
      const res = await fetch((process.env.NODE_ENV === "production" ? "" : "http://localhost:8000") + "/api/videos", {
        method: "POST",
        body: formData
      })

      if(res.status == 200) window.alert('Video uploaded successfully')
      else window.alert('Something went wrong')

    } catch (error) {
      console.error(error)
      window.alert('Something went wrong')
    } finally {
      setIsUploading(false)
    }
  }


  return (
    <main className="">
      <h1 className="text-3xl font-bold text-center">
        Upload Your Video!
      </h1>

      <div className="max-w-5xl min-h-[50vh] mx-auto mt-28">
        {/* A section to upload a video by click or drag and drop */}
        <section className="flex flex-col items-center justify-center min-h-[30vh]">
          {/* File input */}
          <input onChange={handleChange} accept="video/*, " type="file" name="file" id="file" className="!hidden" />

          <label
            {...containerProps}
            htmlFor="file"
            className={"cursor-pointer flex flex-col items-center justify-center w-3/4 h-56 border-4 border-dashed rounded-lg px-8 " + (isDragOver ? 'border-gray-700' : 'border-gray-400')}>
            {
              video ? <>
                <p className="text-2xl font-bold text-gray-600 line-clamp-1" title={video?.name}>Selected: {video?.name}</p>
                <small className="text-center text-gray-400">Click to change</small>
              </> : <>
                <p className="text-2xl font-bold text-gray-600">Drop your file</p>
                <p className="text-2xl font-bold text-gray-700">or</p>
                <p className="text-2xl font-bold text-gray-400">Click to Upload</p>
              </>
            }
          </label>

          <p className="mt-5 text-lg text-gray-600">Only video files are allowed</p>

          <button 
            className="px-5 py-2 mt-5 text-lg font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 flex gap-1 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isUploading}
          >
            {
              isUploading ? <><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-100 mr-1"></div> Uploading...</> : "Upload"
            }
          </button>

        </section>
      </div>

    </main>
  )
}

export default App
