import { useState } from 'react';

const sizes = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-xl',
};

const Avatar = ({ src, name, size = 'md' }) => {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;

  return (
    <>
      {showImg && (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} shrink-0 rounded-full object-cover`}
          onError={() => setFailed(true)}
        />
      )}
      <div
        className={`${sizes[size]} ${showImg ? 'hidden' : ''} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 font-bold text-white ring-2 ring-slate-100`}
      >
        {name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    </>
  );
};

export default Avatar;
