import { useLocation } from 'react-router-dom';
// import menuItems from '../menuItems/menuItems'; 
import { useMenuItems } from '../menuItems/useMenuItems';
import { useTranslation } from 'react-i18next';

import { Toolbar,AppBar,IconButton,Box,Button ,Typography} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';


export default function BAppBar({open, handleToggle }) {
  const location = useLocation();
  const { t } = useTranslation();
  const menuItems = useMenuItems();
  // Geçerli yolu menuItems ile karşılaştır
  let currentTitle = t("İKONX Panel");
  for (let group of menuItems.items) {
    for (let child of group.children) {
      if (child.url === location.pathname) {
        currentTitle = child.title;
        break;
      }
      if (child.type === 'collapse') {
        for (let subItem of child.children) {
          if (subItem.url === location.pathname) {
            currentTitle = subItem.title;
            break;
          }
        }
      }
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{  width:open?`calc(100% - ${200}px)` :"100%", marginLeft: open ? 200 : 0, transition: 'margin 0.3s' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleToggle}  // Toggle fonksiyonunu buraya bağladık
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {currentTitle}
          </Typography>
          <Button color="inherit">{t("login")}</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
