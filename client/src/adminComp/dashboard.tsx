export default function Dashboard() {
  const stats = [
    {
      label: "Total Users",
      value: "14,830",
      change: "+1.5% from last week",
      changeColor: "text-[#0bda6f]",
    },
    {
      label: "New Users (24h)",
      value: "112",
      change: "+8.2% from yesterday",
      changeColor: "text-[#0bda6f]",
    },
    {
      label: "Active Confessions",
      value: "5,923",
      change: "-0.5% from yesterday",
      changeColor: "text-[#fa6c38]",
    },
    {
      label: "Reported Content",
      value: "88",
      change: "+12% from last week",
      changeColor: "text-red-500",
    },
  ];

  const users = [
    {
      id: "#USR123",
      name: "Alex Johnson",
      email: "alex.j@stateu.edu",
      college: "State University",
      joinDate: "2023-10-26",
    },
    {
      id: "#USR124",
      name: "Maria Garcia",
      email: "m.garcia@tech.edu",
      college: "Tech Institute",
      joinDate: "2023-10-25",
    },
    {
      id: "#USR125",
      name: "Chen Wei",
      email: "chen.w@college.edu",
      college: "Central College",
      joinDate: "2023-10-24",
    },
  ];

  return (
    <>
      {/* PageHeading */}
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
            Dashboard
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal">
            Welcome back, Admin! Here's a quick overview of the platform.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-card-dark p-6 border border-slate-200 dark:border-slate-800 shadow-soft dark:shadow-none"
          >
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">
              {stat.label}
            </p>
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
              {stat.value}
            </p>
            <p
              className={`${stat.changeColor} text-sm font-medium leading-normal`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* User Management Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-soft dark:shadow-none">
        {/* SectionHeader */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
            Recent Users
          </h2>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <span className="material-symbols-outlined text-base">
              visibility
            </span>
            View All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3 font-semibold" scope="col">
                  User ID
                </th>
                <th className="px-6 py-3 font-semibold" scope="col">
                  Name
                </th>
                <th className="px-6 py-3 font-semibold" scope="col">
                  Email
                </th>
                <th className="px-6 py-3 font-semibold" scope="col">
                  College
                </th>
                <th className="px-6 py-3 font-semibold" scope="col">
                  Join Date
                </th>
                <th className="px-6 py-3 text-right font-semibold" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {users.map((user, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {user.id}
                  </td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.college}</td>
                  <td className="px-6 py-4">{user.joinDate}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">
                        visibility
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
