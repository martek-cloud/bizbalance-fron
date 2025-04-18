import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';

const RecentUsersBoard = ({ data = [] }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      comptable: 'bg-blue-100 text-blue-700',
      user: 'bg-green-100 text-green-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recently Added Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.length > 0 ? (
          data.map((user) => (
            <div key={user.id} className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10">
                  {getInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role_type)}`}>
                {user.role_type}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500">
            <UserCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">No recent users</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentUsersBoard;