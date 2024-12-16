import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Drawer, List, ListItemButton, ListItemText, ListItemIcon, Collapse, IconButton, Divider,
    ListItem,CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useAuth } from '../../context/AuthContext';
import { useMenuItems } from '../menuItems/useMenuItems';

function Sidebar({ open, handleToggle }) {
    const { user, loading } = useAuth();
    const menuItems = useMenuItems();
    const [openItems, setOpenItems] = useState({});
    const [filteredMenu, setFilteredMenu] = useState([]);

    const hasPermission = useCallback((requiredPermission) => {
        if (!requiredPermission) return true;
        if (Array.isArray(requiredPermission)) {
            return requiredPermission.some((perm) => user?.role?.permissions?.includes(perm));
        }
        return user?.role?.permissions?.includes(requiredPermission);
    }, [user?.role?.permissions]);

    const filterItemsRecursively = useCallback((items) => {
        return items
            .map((item) => {
                if (item.type === 'item') {
                    return hasPermission(item.requiredPermission) ? item : null;
                } else if (item.type === 'collapse' || item.type === 'group') {
                    const filteredChildren = filterItemsRecursively(item.children || []);
                    if (filteredChildren.length > 0) {
                        return { ...item, children: filteredChildren };
                    }
                    return null;
                }
                return null;
            })
            .filter(Boolean);
    }, [hasPermission]);

    useEffect(() => {
        if (user?.role?.permissions) {
            const filtered = filterItemsRecursively(menuItems.items);
            setFilteredMenu(filtered);
        } else {
            setFilteredMenu([]);
        }
    }, [ filterItemsRecursively, user?.role?.permissions]);

    const handleToggleSide = useCallback((id) => {
        setOpenItems((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }, []);

//   const hasPermission = useCallback((requiredPermission) => {
//     if (!requiredPermission) return true;
//     if (Array.isArray(requiredPermission)) {
//       return requiredPermission.some((perm) => user?.role?.permissions?.includes(perm));
//     }
//     return user?.role?.permissions?.includes(requiredPermission);
//   }, [user?.role?.permissions]);

//   const filterItemsRecursively = useCallback((items) => {
//     return items
//       .map((item) => {
//         if (item.type === 'item') {
//           return hasPermission(item.requiredPermission) ? item : null;
//         } else if (item.type === 'collapse' || item.type === 'group') {
//           const filteredChildren = filterItemsRecursively(item.children || []);
//           if (filteredChildren.length > 0) {
//             return { ...item, children: filteredChildren };
//           }
//           return null;
//         }
//         return null;
//       })
//       .filter(Boolean);
//   }, [hasPermission]);

//   const filteredMenu = useMemo(() => {
//     if (!user || !user.role || !user.role.permissions) {
//       return [];
//     }
//     return filterItemsRecursively(menuItems.items);
//   }, [menuItems.items, hasPermission, user?.role?.permissions]);
// useEffect(() => {
//     if (!user || !user.role || !user.role.permissions) {
//       setFilteredMenu([]);
//       return;
//     }
//     setFilteredMenu(filterItemsRecursively(menuItems.items));
//   }, [menuItems.items, hasPermission, user]);

// const filteredMenu = useMemo(() => {
//     if (!user || !user.role || !user.role.permissions) {
//       return [];
//     }
//     return filterItemsRecursively(menuItems.items);
//   }, [menuItems.items, filterItemsRecursively, user?.role?.permissions]);
// useEffect(() => {
//     if (user?.role?.permissions) {
//       const filtered = filterItemsRecursively(menuItems.items);
//       setFilteredMenu(filtered);
//     }
//   }, [menuItems.items, filterItemsRecursively, user?.role?.permissions]);

// useEffect(() => {
//     console.log(user?.role)
//     if (user?.role?.permissions) {
//       const filtered = filterItemsRecursively(menuItems.items);
//       setFilteredMenu(filtered);
//     } else {
//       setFilteredMenu([]);
//     }
//   }, [ user?.role?.permissions]);


//   const handleToggleSide = useCallback((id) => {
//     setOpenItems((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   }, []);

if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </div>
    );
}

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <List>
        <ListItem>
          <ListItemIcon>
            <IconButton onClick={handleToggle}>
              <CloseIcon />
            </IconButton>
          </ListItemIcon>
        </ListItem>
        <Divider />
        {filteredMenu.map((menuItem) => (
          <React.Fragment key={menuItem.id}>
            {menuItem.type === 'group' ? (
              menuItem.children.map((child) => (
                child.type === 'collapse' ? (
                  <React.Fragment key={child.id}>
                    <ListItemButton onClick={() => handleToggleSide(child.id)}>
                      <ListItemIcon>{child.icon && <child.icon />}</ListItemIcon>
                      <ListItemText primary={child.title} />
                      {openItems[child.id] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={openItems[child.id]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {child.children.map((subItem) => (
                          <ListItemButton key={subItem.id} component="a" href={subItem.url} style={{paddingLeft:2}}>
                            <ListItemIcon>{subItem.icon && <subItem.icon />}</ListItemIcon>
                            <ListItemText inset primary={subItem.title} style={{paddingLeft:8}} primaryTypographyProps={{ fontSize: 14, lineHeight:1 }} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                ) : (
                  <ListItemButton key={child.id} component="a" href={child.url}>
                    <ListItemIcon>{child.icon && <child.icon />}</ListItemIcon>
                    <ListItemText primary={child.title} />
                  </ListItemButton>
                )
              ))
            ) : null}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
