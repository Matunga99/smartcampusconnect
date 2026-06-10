package com.smartcampus.connect;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import com.smartcampus.connect.fragments.DashboardTabFragment;

/**
 * Generic pager adapter that creates DashboardTabFragment instances by tab index.
 * The host Activity passes data into fragments via the tabIndex argument.
 */
public class DashboardPagerAdapter extends FragmentStateAdapter {

    private final int tabCount;

    public DashboardPagerAdapter(@NonNull FragmentActivity fa, int tabCount) {
        super(fa);
        this.tabCount = tabCount;
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        return DashboardTabFragment.newInstance(position);
    }

    @Override
    public int getItemCount() {
        return tabCount;
    }
}
