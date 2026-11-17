import { initials } from '../format';
import type { Theme } from '../hooks/useTheme';
import type { Me } from '../types';
import { Icon } from './Icon';

interface Props {
    me: Me;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    onLogout: () => void;
}

export function Sidebar({ me, theme, onThemeChange, onLogout }: Props) {
    return (
        <nav className="rail">
            <img className="rail-logo" src="/db-logo.webp" alt="Deutsche Bank" />

            <button className="rail-btn active" title="Chats" aria-label="Chats">
                <Icon name="chat" />
            </button>

            <div className="rail-spacer" />

            <div className="avatar" title={me.email}>
                {initials(me.email)}
            </div>

            <button className="rail-btn" onClick={onLogout} title="Sign out" aria-label="Sign out">
                <Icon name="logout" />
            </button>

            <div className="theme-switch" role="group" aria-label="Theme">
                <button
                    className={theme === 'dark' ? 'active' : ''}
                    onClick={() => onThemeChange('dark')}
                    aria-label="Dark mode"
                    aria-pressed={theme === 'dark'}
                >
                    <Icon name="moon" size={15} />
                </button>
                <button
                    className={theme === 'light' ? 'active' : ''}
                    onClick={() => onThemeChange('light')}
                    aria-label="Light mode"
                    aria-pressed={theme === 'light'}
                >
                    <Icon name="sun" size={15} />
                </button>
            </div>
        </nav>
    );
}