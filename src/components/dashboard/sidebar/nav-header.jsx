import React from 'react'
import { Link } from 'react-router-dom'
import bizBalanceLogo from '@/assets/bizbalance-logo.jpg'

export function NavHeader() {
  return (
    <div className="border-b border-border/50">
      <Link 
        to="/dashboard" 
        className="flex h-[60px] items-center justify-center px-6 transition-colors hover:bg-accent/50"
      >
        <img 
          src={bizBalanceLogo} 
          alt="BizBalance" 
          className="h-8 w-auto transition-transform duration-200 group-[[data-collapsible=icon]]/sidebar-wrapper:h-6
            dark:brightness-125 dark:contrast-125"
        />
      </Link>
    </div>
  )
}
