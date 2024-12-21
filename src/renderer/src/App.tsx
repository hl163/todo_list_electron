import { useEffect, useState } from 'react'
import Settings  from './components/settings';
// 新增：导入 Electron 的 ipcRenderer
const { ipcRenderer } = window.electron

function App(): JSX.Element {
  const [todos, setTodos] = useState<{ text: string; completed: boolean }[] | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('未完成') // 添加筛选状态
  const [showSettings, setShowSettings] = useState(false) // 新增：用于控制设置div的显示

  const handleAddTodo = (
    e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>
  ): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (e.key === 'Enter' || e.type === 'click') {
      if (inputValue.trim()) {
        setTodos(
          todos
            ? [...todos, { text: inputValue, completed: false }]
            : [{ text: inputValue, completed: false }]
        )
        setInputValue('')
      }
    }
  }

  const handleDeleteTodo = (index: number): void => {
    if (todos) {
      const newTodos = todos.filter((_, i) => i !== index)
      setTodos(newTodos)
    }
  }

  const handleToggleCompleted = (index: number): void => {
    if (todos) {
      const newTodos = todos.map((todo, i) =>
        i === index ? { ...todo, completed: !todo.completed } : todo
      )
      setTodos(newTodos)
    }
  }

  const filteredTodos = todos
    ? todos.filter((todo) =>
        filter === '未完成' ? !todo.completed : filter === '已完成' ? todo.completed : true
      )
    : []

  // 新增：在组件挂载时读取历史待办事项
  useEffect(() => {
    ipcRenderer.send('get-todos') // 发送读取待办事项的IPC调用
    ipcRenderer.on('send-todos', (_event, storedTodos) => {
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos))
      }
    })

    // 新增：监听主进程发送的open-settings事件
    ipcRenderer.on('open-settings', () => {
      setShowSettings(true)
    })

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return () => {
      ipcRenderer.removeAllListeners('send-todos') // 清理监听器
      ipcRenderer.removeAllListeners('open-settings') // 清理监听器
    }
  }, [])

  // 新增：在待办事项更新时保存到 Electron
  useEffect(() => {
    if (todos) {
      ipcRenderer.send('save-todos', JSON.stringify(todos))
    }
  }, [todos])

  // 新增：在设置窗口打开的情况下按下esc关闭设置窗口
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSettings(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [showSettings])

  return (
    <div style={{ margin: '20px', padding: '20px', borderRadius: '10px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginBottom: '20px'
        }}
      >
        <button
          onClick={() => setFilter('未完成')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: filter === '未完成' ? '#007bff' : '#ccc',
            color: 'white',
            cursor: 'pointer',
            marginRight: '10px',
            flex: 1
          }}
        >
          未完成
        </button>
        <button
          onClick={() => setFilter('已完成')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: filter === '已完成' ? '#007bff' : '#ccc',
            color: 'white',
            cursor: 'pointer',
            marginRight: '10px',
            flex: 1
          }}
        >
          已完成
        </button>
        <button
          onClick={() => setFilter('所有')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: filter === '所有' ? '#007bff' : '#ccc',
            color: 'white',
            cursor: 'pointer',
            flex: 1
          }}
        >
          所有
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="请输入待办事项"
          onKeyDown={handleAddTodo}
          style={{
            flex: 1,
            marginRight: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            outline: 'none',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
          }}
        />
        <button
          onClick={handleAddTodo}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          +
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                marginBottom: '10px'
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleCompleted(index)}
                style={{ marginRight: '10px' }}
              />
              <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', flex: 1 }}>
                {todo.text}
              </span>
              <button
                onClick={() => handleDeleteTodo(index)}
                style={{
                  padding: '5px 10px',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                删除
              </button>
            </div>
          ))
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#ccc'
            }}
          >
            <div style={{ fontSize: '18px', marginTop: '10px' }}>暂无待办事项</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>点击上方加号添加新的待办事项</div>
          </div>
        )}
      </div>

      {showSettings && (
       <Settings/>
      )}
    </div>
  )
}

export default App
