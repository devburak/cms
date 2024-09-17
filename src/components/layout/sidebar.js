import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse, IconButton, Tooltip, ListItemButton, Divider } from '@mui/material';
// import menuItems from '../menuItems/menuItems';
import { useMenuItems } from '../menuItems/useMenuItems';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

function Sidebar({ open, handleToggle }) {

    const [openItems, setOpenItems] = useState({});

    const handleToggleSide = (id) => {
        setOpenItems((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };


    const menuItems = useMenuItems();
    return (
        <Drawer
            variant="persistent"
            anchor="left"
            open={open}
            sx={{
                width: 200,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 200,
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
            </List>
            <List>
                {menuItems.items.map((menuItem) => (
                    <React.Fragment key={menuItem.id}>
                        {menuItem.type === 'group' && menuItem.children.map((child) => (
                            child.type === 'item' ? (

                                <ListItemButton key={child.id} component="a" href={child.url} >
                                    <ListItemIcon>
                                        <child.icon />
                                    </ListItemIcon>
                                    <ListItemText primary={child.title}  primaryTypographyProps={{ fontSize: 14 }} />
                                </ListItemButton>

                            ) : (
                                <React.Fragment key={child.id}>

                                    <ListItemButton onClick={() => handleToggleSide(menuItem.id)} >
                                        <ListItemIcon>
                                            <child.icon />
                                        </ListItemIcon>
                                        <ListItemText primary={menuItem.title} primaryTypographyProps={{ fontSize: 14 }} />
                                        {openItems[menuItem.id] ? <ExpandLess /> : <ExpandMore />}
                                    </ListItemButton>

                                    <Collapse in={openItems[menuItem.id]} timeout="auto" unmountOnExit >
                                        <List component="div" disablePadding>
                                            {child.children.map((subItem) => (
                                                <ListItemButton key={subItem.id} component="a" href={subItem.url}>
                                                    <ListItemText inset primary={subItem.title}  primaryTypographyProps={{ fontSize: 12 }} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>

                                </React.Fragment>
                            )
                        ))}
                    </React.Fragment>
                ))}
            </List>
        </Drawer>
    );
}

export default Sidebar;
