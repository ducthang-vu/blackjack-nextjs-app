import React from 'react'

interface ActionButton {
    label: string,
    onClick: () => void,
}

interface ActionBarProps {
    username: string,
    credits: number,
    /** The bet on the table, or null between hands. */
    pot: number | null,
    message: string,
    buttons: ActionButton[],
    disabled: boolean,
}

const money = (amount: number): string =>
    `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

/** The player's side of the game: who's playing, their money, the message and the available moves. */
const ActionBar = ({ username, credits, pot, message, buttons, disabled }: ActionBarProps): React.JSX.Element => (
    <section className="panel action-bar" aria-label="Your moves">
        <dl className="stats">
            <div className="stat">
                <dt>Player</dt>
                <dd>{username}</dd>
            </div>
            <div className="stat">
                <dt>Credit</dt>
                <dd>{money(credits)}</dd>
            </div>
            <div className="stat">
                <dt>Bet</dt>
                <dd>{pot === null ? '–' : money(pot)}</dd>
            </div>
        </dl>
        <p className="message" aria-live="polite">{message}</p>
        {buttons.length > 0 &&
            <div className="buttons">
                {buttons.map(({ label, onClick }) =>
                    <button
                        key={label}
                        type="button"
                        className={`btn${buttons.length === 1 ? ' btn-primary' : ''}`}
                        onClick={onClick}
                        disabled={disabled}
                    >
                        {label}
                    </button>
                )}
            </div>
        }
        <style jsx>{`
            .action-bar {
                padding: var(--space-4);
                display: flex;
                flex-direction: column;
                gap: var(--space-3);
            }

            .stats {
                margin: 0;
                display: flex;
                gap: var(--space-5);
            }

            .stat dt {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                color: var(--text-muted);
            }

            .stat dd {
                margin: 0;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                overflow-wrap: anywhere;
            }

            .message {
                font-size: 18px;
                font-weight: 600;
            }

            .buttons {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
            }

            /* On a phone the bar stays at the bottom of the screen, next to the cards. */
            @media (max-width: 640px) {
                .action-bar {
                    position: sticky;
                    bottom: var(--space-2);
                    z-index: 1;
                }

                .stats {
                    gap: var(--space-4);
                }

                .buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
                }
            }
        `}</style>
    </section>
)

export default ActionBar
