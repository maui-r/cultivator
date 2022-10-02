import { Divider, Menu, MenuItem, styled } from '@mui/material'
import { useAppStore } from '../../stores'

const MenuHeading = styled(MenuItem)({})

const ProfileMenu = () => {
    const profileMenuPosition = useAppStore((state) => state.profileMenuPosition)
    const profileMenuHandle = useAppStore((state) => state.profileMenuHandle)
    const setProfileMenu = useAppStore((state) => state.setProfileMenu)

    if (!profileMenuPosition) return null

    const onCloseProfileMenu = () => {
        setProfileMenu(null, null)
    }

    const showOnLensFrens = () => {
        window.open(
            `https://lensfrens.xyz/${profileMenuHandle}`,
            '_blank'
        )
    }

    return (
        <Menu
            open={!!profileMenuPosition && !!profileMenuHandle}
            onClose={onCloseProfileMenu}
            anchorReference="anchorPosition"
            anchorPosition={profileMenuPosition}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
        >
            <MenuHeading>{profileMenuHandle}</MenuHeading>
            <Divider />
            <MenuItem onClick={onCloseProfileMenu}>Follow</MenuItem>
            <MenuItem onClick={showOnLensFrens}>Show on LensFrens</MenuItem>
        </Menu >
    )
}

export default ProfileMenu