import { useEffect, useRef, useState } from 'react'

const Settings: React.FC = (): JSX.Element => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === '+') {
        setInputValue((prevValue) => prevValue + '+')
      }
    }

    if (inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown)
    }

    return (): void => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans - serif',
        fontSize: '16px',
        color: '#333'
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '80%',
          backgroundColor: 'white',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          padding: '20px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space - between',
            width: '100%',
            borderBottom: '1px solid #ccc',
            padding: '20px',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              flex: 1,
              padding: '10px',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            设置显示（隐藏快捷键）
          </div>
          <div
            style={{
              flex: 1,
              padding: '10px',
              fontWeight: 'bold',
              color: '#333',
              display: 'flex',
              justifyContent: 'flex - start'
            }}
          >
            <input
              type="text"
              value={inputValue}
              ref={inputRef}
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                width: '100%',
                outline: 'none',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                color: '#333',
                fontSize: '16px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
