export default function App() {
  return (
    <div>
      <h1>Permission Kit React Demo</h1>

      <button permission="user.create">
        新增用户
      </button>

      <button permission="user.delete" permissionMode="disabled">
        删除用户
      </button>
    </div>
  )
}