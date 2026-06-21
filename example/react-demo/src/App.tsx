import { Can } from '@permission-kit/react'

export default function App() {
  const handleAdd = () => {
    console.log('add')
  }

  const handleDelete = () => {
    console.log('delete')
  }

  return (
    <div>
      <h1>Permission Kit React Demo</h1>
      <Can permission={'user.create'}>
        <button onClick={handleAdd} permission="user.create">
          新增用户
        </button>
      </Can>
      <Can permission={'user.delete'}>
        <button onClick={handleDelete} permission="user.delete" permissionMode="disabled">
          删除用户
        </button>
      </Can>
    </div>
  )
}
