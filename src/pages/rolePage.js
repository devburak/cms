import React, { useState } from 'react';
import RoleForm from '../components/role/RoleForm';
import RoleList from '../components/role/RoleList';

const RolePage = () => {
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const handleEditRole = (roleId) => {
    setSelectedRoleId(roleId);
  };

  const handleSaveRole = () => {
    setSelectedRoleId(null); // Kaydettikten sonra formu sıfırlamak için
  };

  return (
    <div>
      <RoleForm roleId={selectedRoleId} onSave={handleSaveRole} />
      <RoleList onEdit={handleEditRole} />
    </div>
  );
};

export default RolePage;
