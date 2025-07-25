import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles.module.scss';
import { colorScheme } from './colorScheme.ts';
import { AuthorType } from '../../../../../types/data/authorType.ts';

interface AuthorSelectionProps {
  authorList: AuthorType[];
  selectedAuthors: AuthorType[];
  onAuthorsChange: (authors: AuthorType[]) => void;
  containerWidth?: number;
}

const AuthorSelection: React.FC<AuthorSelectionProps> = ({ authorList, selectedAuthors = [], onAuthorsChange, containerWidth = 500 }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredAuthors, setFilteredAuthors] = useState<AuthorType[]>([]);
  const [buttonHover, setButtonHover] = useState<boolean>(false);
  // Track temporary selections while dropdown is open
  const [tempSelectedAuthors, setTempSelectedAuthors] = useState<AuthorType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableAuthors = authorList.filter((author) => author.selected);

  // Initialize temp selections when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedAuthors([...selectedAuthors]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAuthors(availableAuthors);
    } else {
      const filtered = availableAuthors.filter((author) =>
        (author.displayName || author.user.gitSignature).toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredAuthors(filtered);
    }
  }, [searchTerm, authorList]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Apply changes when clicking outside
        onAuthorsChange(tempSelectedAuthors);
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, tempSelectedAuthors, onAuthorsChange]);

  const handleToggleDropdown = (): void => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleSelectAuthor = (author: AuthorType, event: React.MouseEvent): void => {
    // Prevent event bubbling to avoid triggering other click handlers
    event.preventDefault();
    event.stopPropagation();

    // Check if author is already selected
    const isSelected = tempSelectedAuthors.some((a) => a.id === author.id);

    if (isSelected) {
      // Remove author if already selected
      setTempSelectedAuthors(tempSelectedAuthors.filter((a) => a.id !== author.id));
    } else {
      // Add author to selection
      setTempSelectedAuthors([...tempSelectedAuthors, author]);
    }

    // Keep dropdown open and focus on search
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemoveAuthor = (authorId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent closing dropdown
    setTempSelectedAuthors(tempSelectedAuthors.filter((a) => a.id !== authorId));
  };

  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent closing dropdown
    setTempSelectedAuthors([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDone = () => {
    // Apply changes when Done is clicked
    onAuthorsChange(tempSelectedAuthors);
    setIsOpen(false);
  };

  const getAuthorDisplayName = (author: AuthorType): string => {
    return author.displayName || author.user.gitSignature;
  };

  const getFontSize = () => {
    return `${Math.max(0.75, Math.min(0.9, containerWidth / 600))}em`;
  };

  const getDotSize = () => {
    return `${Math.max(0.4, Math.min(0.8, containerWidth / 700))}em`;
  };

  const getPadding = () => {
    return `${Math.max(0.25, Math.min(0.6, containerWidth / 600))}em`;
  };

  // For display in the closed dropdown, use the confirmed selection
  const displayAuthors = isOpen ? tempSelectedAuthors : selectedAuthors;

  return (
    <div
      ref={containerRef}
      className={`${styles.authorSelector || ''}`}
      style={{
        width: '70%',
        margin: '0 auto',
        fontSize: getFontSize(),
        position: 'relative',
      }}>
      <div
        ref={dropdownRef}
        className={`${styles.authorSelectorToggle || ''}`}
        onClick={handleToggleDropdown}
        style={{
          backgroundColor: colorScheme.background,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: isOpen ? colorScheme.primary : colorScheme.grid,
          boxShadow: isOpen ? `0 0 0 2px ${colorScheme.primary}20` : 'none',
          color: colorScheme.text,
          padding: getPadding(),
          borderRadius: '0.375em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.3s ease-in-out',
          width: '100%',
          minHeight: '2.5em',
        }}>
        {selectedAuthors.length > 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              flexWrap: 'nowrap',
              gap: '0.4em',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxHeight: '2em',
            }}>
            {selectedAuthors.length <= 3 ? (
              selectedAuthors.map((author) => (
                <div
                  key={author.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: `${author.color.main}15`,
                    borderRadius: '1em',
                    padding: '0.2em 0.4em',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                  <div
                    style={{
                      width: '0.8em',
                      height: '0.8em',
                      borderRadius: '50%',
                      backgroundColor: author.color.main,
                      marginRight: '0.3em',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.9em',
                    }}>
                    {getAuthorDisplayName(author)}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>{selectedAuthors.length} authors selected</span>
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: 'gray' }}>Select authors</span>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <svg
            style={{
              width: getDotSize(),
              height: getDotSize(),
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease-in-out',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            top: '100%',
            left: 0,
            marginTop: '0.25em',
            borderRadius: '0.375em',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            backgroundColor: colorScheme.background,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colorScheme.grid,
            animation: 'dropdownFadeIn 0.2s ease-out forwards',
          }}>
          <div
            style={{
              padding: getPadding(),
              backgroundColor: colorScheme.background,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5em',
            }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: getPadding(),
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: colorScheme.grid,
                borderRadius: '0.375em',
                color: colorScheme.text,
                backgroundColor: colorScheme.background,
                fontSize: '1em',
                outline: 'none',
              }}
            />

            {tempSelectedAuthors.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.3em',
                  maxHeight: '80px',
                  overflowY: 'auto',
                  padding: '0.3em',
                }}>
                {tempSelectedAuthors.map((author) => (
                  <div
                    key={author.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: `${author.color.main}15`,
                      borderRadius: '1em',
                      padding: '0.2em 0.6em',
                      border: `1px solid ${author.color.main}30`,
                    }}>
                    <div
                      style={{
                        width: '0.8em',
                        height: '0.8em',
                        borderRadius: '50%',
                        backgroundColor: author.color.main,
                        marginRight: '0.3em',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        marginRight: '0.3em',
                        fontSize: '0.9em',
                      }}>
                      {getAuthorDisplayName(author)}
                    </span>
                    <span
                      onClick={(e) => handleRemoveAuthor(author.id, e)}
                      style={{
                        cursor: 'pointer',
                        color: '#666',
                        fontWeight: 'bold',
                        fontSize: '1.1em',
                        lineHeight: '1em',
                      }}>
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              backgroundColor: colorScheme.background,
            }}>
            {filteredAuthors.length > 0 ? (
              filteredAuthors.map((author) => {
                const isSelected = tempSelectedAuthors.some((a) => a.id === author.id);
                return (
                  <div
                    key={author.id}
                    onClick={(e) => handleSelectAuthor(author, e)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: getPadding(),
                      cursor: 'pointer',
                      backgroundColor: isSelected ? `${author.color.main}15` : 'transparent',
                      borderLeftWidth: '3px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: isSelected ? author.color.main : 'transparent',
                      transition: 'background-color 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${author.color.main}10`;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      } else {
                        e.currentTarget.style.backgroundColor = `${author.color.main}15`;
                      }
                    }}>
                    <div
                      style={{
                        width: '1em',
                        height: '1em',
                        borderRadius: '50%',
                        backgroundColor: author.color.main,
                        marginRight: '0.6em',
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                      }}>
                      {getAuthorDisplayName(author)}
                    </span>
                    {isSelected && (
                      <div
                        style={{
                          marginLeft: 'auto',
                          color: author.color.main,
                        }}>
                        ✓
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: getPadding(),
                  textAlign: 'center',
                  color: colorScheme.text,
                }}>
                No authors found
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: getPadding(),
              borderTop: `1px solid ${colorScheme.grid}`,
            }}>
            {tempSelectedAuthors.length > 0 ? (
              <button
                onClick={(e) => handleClearAll(e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colorScheme.primary,
                  cursor: 'pointer',
                  padding: '0.3em 0.6em',
                  fontSize: '0.9em',
                }}>
                Clear all
              </button>
            ) : (
              <div></div>
            )}
            <button
              onClick={handleDone}
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
              style={{
                backgroundColor: buttonHover ? `${colorScheme.primary}e0` : colorScheme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '0.375em',
                padding: '0.4em 0.9em',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontWeight: 500,
                transition: 'all 0.2s ease-in-out',
                transform: buttonHover ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: buttonHover ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorSelection;
